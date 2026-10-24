/**
 * Orbit Dashboard - Auto-Moderation Tab
 * 1:1 Pixel-Perfect Recreation of PeakBot Auto-Moderation UI with Full Custom Dropdowns & Custom Toggles
 */

(function () {
  'use strict';

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showNotify(msg, type = 'success') {
    if (window.Toast && typeof Toast[type] === 'function') Toast[type](msg);
    else if (window.Toast && typeof Toast.show === 'function') Toast.show(msg, type);
    else if (window.Notifications && typeof Notifications.show === 'function') Notifications.show(msg, type);
    else console.log(`[${type}] ${msg}`);
  }

  function formatRelativeTime(unixSeconds) {
    if (!unixSeconds) return 'Just now';
    const nowSec = Math.floor(Date.now() / 1000);
    const diff = Math.max(0, nowSec - Number(unixSeconds));
    if (diff < 60) return `${Math.max(1, diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const days = Math.floor(diff / 86400);
    if (days < 30) return `${days}d ago`;
    return new Date(Number(unixSeconds) * 1000).toLocaleDateString('en-US');
  }

  // Common SVG Icons
  const SVGS = {
    shieldAlert: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert w-5 h-5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>`,
    sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles w-4 h-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>`,
    crown: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crown shrink-0 -ml-px opacity-90"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>`,
    lock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock w-4 h-4 text-violet-400 group-hover:text-violet-300 transition-[color]"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    lockSmall: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock w-3 h-3 -ml-0.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    scanEye: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scan-eye w-4 h-4"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path><circle cx="12" cy="12" r="1"></circle><path d="M5 12s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5"></path></svg>`,
    filter: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-filter w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4"><path d="m6 9 6 6 6-6"></path></svg>`,
    zap: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap w-4 h-4"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
    link2: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link2 w-4 h-4"><path d="M9 17H7A5 5 0 0 1 7 7h2"></path><path d="M15 7h2a5 5 0 1 1 0 10h-2"></path><line x1="8" x2="16" y1="12" y2="12"></line></svg>`,
    gavel: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gavel w-4 h-4"><path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8"></path><path d="m16 16 6-6"></path><path d="m8 8 6-6"></path><path d="m9 7 8 8"></path><path d="m21 11-8-8"></path></svg>`,
    alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle w-4 h-4"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search w-3.5 h-3.5"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,
    searchLg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search w-6 h-6 text-neutral-800 mx-auto mb-3"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings w-4 h-4"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    shield: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-4 h-4"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>`,
    messageSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    pencil: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil w-3.5 h-3.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>`,
    trash2: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2 w-3.5 h-3.5"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-3.5 h-3.5 text-green-400"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    logIn: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in w-3.5 h-3.5 text-neutral-500"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" x2="3" y1="12" y2="12"></line></svg>`,
    logOut: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out w-3.5 h-3.5 text-neutral-500"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>`,
    mic: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic w-3.5 h-3.5 text-purple-400"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>`,
    eyeOff: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off w-3.5 h-3.5 text-neutral-500"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>`,
    mail: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail w-4 h-4 text-indigo-300"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`,
    timer: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-timer w-4 h-4"><line x1="10" x2="14" y1="2" y2="2"></line><line x1="12" x2="15" y1="14" y2="11"></line><circle cx="12" cy="14" r="8"></circle></svg>`,
    doorOpen: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-door-open w-4 h-4"><path d="M13 4h3a2 2 0 0 1 2 2v14"></path><path d="M2 20h3"></path><path d="M13 20h9"></path><path d="M10 12v.01"></path><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path></svg>`,
    ban: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ban w-4 h-4"><circle cx="12" cy="12" r="10"></circle><path d="m4.9 4.9 14.2 14.2"></path></svg>`,
    chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right w-3.5 h-3.5"><path d="m9 18 6-6-6-6"></path></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"></polyline></svg>`
  };

  // Orbit Custom Toggle Switch
  function renderCustomToggle(id, checked, label = '') {
    const isChecked = Boolean(checked);
    return `
      <button 
        type="button" 
        role="switch" 
        id="${escapeHtml(id)}"
        aria-checked="${isChecked ? 'true' : 'false'}" 
        ${label ? `aria-label="${escapeHtml(label)}"` : ''}
        class="orbit-custom-toggle relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ${isChecked ? 'bg-white' : 'bg-neutral-700'}"
      >
        <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out ${isChecked ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-900'}"></span>
      </button>
    `;
  }

  function renderActionPills(groupKey, currentAction = 'delete') {
    const actions = [
      { id: 'delete', label: 'Delete' },
      { id: 'warn', label: 'Warn' },
      { id: 'timeout', label: 'Timeout' },
      { id: 'kick', label: 'Kick' },
      { id: 'ban', label: 'Ban' }
    ];
    return `
      <div class="flex flex-wrap gap-0.5 p-0.5 rounded-xl bg-neutral-800" data-action-group="${escapeHtml(groupKey)}">
        ${actions.map(act => {
          const isActive = currentAction === act.id;
          return `
            <button 
              type="button" 
              class="mod-action-pill flex-1 whitespace-nowrap px-2.5 py-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition-[color,background-color,box-shadow,scale] duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${isActive ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}" 
              data-group="${escapeHtml(groupKey)}" 
              data-action="${act.id}"
            >${act.label}</button>
          `;
        }).join('')}
      </div>
    `;
  }

  // Master Dashboard Tab Handler
  DashboardTabs.AutoMod = async function (container, guildId) {
    container.innerHTML = `
      <div class="p-8 flex items-center justify-center min-h-[400px]">
        <div class="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    `;

    // Fetch live configuration, channels, roles, and mod activity
    let rawConfig = {};
    let channels = [];
    let roles = [];
    let modActivity = [];
    let currentGuild = { id: guildId, name: 'Server' };

    try {
      const [cfgRes, actRes] = await Promise.all([
        API.getConfig(guildId).catch(() => ({})),
        API.getModActivity ? API.getModActivity(guildId).catch(() => []) : Promise.resolve([])
      ]);

      rawConfig = cfgRes?.config || cfgRes || {};
      channels = Array.isArray(cfgRes?.channels) ? cfgRes.channels : [];
      roles = Array.isArray(cfgRes?.roles) ? cfgRes.roles : [];
      modActivity = Array.isArray(actRes) ? actRes : [];

      if (cfgRes?.guild) {
        currentGuild = cfgRes.guild;
      } else if (window.__currentDashboardGuildObj) {
        currentGuild = window.__currentDashboardGuildObj;
      }
    } catch (e) {
      console.warn('[AutoMod] Fetch error:', e);
    }

    const textChannels = channels.filter(c => !c.type || c.type === 'text' || c.type === 0 || c.type === 5 || (typeof c.type === 'string' && c.type.includes('text')));

    const automodCfg = rawConfig.automod || {};
    const logsCfg = rawConfig.logs || {};

    const state = {
      // Content Filter
      content_filter_enabled: Boolean(automodCfg.banned_words?.enabled),
      filter_level: automodCfg.banned_words?.filter_level || 'relaxed',
      content_action: automodCfg.banned_words?.action || 'delete',
      banned_words: Array.isArray(automodCfg.banned_words?.words) ? [...automodCfg.banned_words.words] : [],
      allowed_words: Array.isArray(automodCfg.banned_words?.allowed_words) ? [...automodCfg.banned_words.allowed_words] : [],
      word_list_open: false,

      // Spam Protection
      spam_enabled: Boolean(automodCfg.anti_spam?.enabled),
      spam_messages: Number(automodCfg.anti_spam?.max_messages) || 5,
      spam_time_sec: Number(automodCfg.anti_spam?.time_window_sec) || 5,
      spam_action: automodCfg.anti_spam?.action || 'delete',
      spam_sensitivity: 'normal',

      // Link Filter
      links_enabled: Boolean(automodCfg.anti_link?.enabled),
      block_invites: Boolean(automodCfg.anti_invites?.enabled),
      allow_media: Boolean(automodCfg.anti_link?.allow_media !== false),
      allow_gifs: Boolean(automodCfg.anti_link?.allow_gifs !== false),
      link_action: automodCfg.anti_link?.action || 'delete',
      allowed_domains: Array.isArray(automodCfg.anti_link?.allowed_domains) ? [...automodCfg.anti_link.allowed_domains] : [],
      blocked_domains: Array.isArray(automodCfg.anti_link?.blocked_domains) ? [...automodCfg.anti_link.blocked_domains] : [],

      // General settings
      log_channel: automodCfg.log_channel || '',
      caps_filter_enabled: Boolean(automodCfg.anti_caps?.enabled),
      caps_percent: Number(automodCfg.anti_caps?.percent) || 70,
      max_mentions: Number(automodCfg.mention_spam?.max_mentions) || 5,

      // Exemptions
      exempt_roles: Array.isArray(automodCfg.exempt_roles) ? [...automodCfg.exempt_roles.map(String)] : [],
      exempt_channels: Array.isArray(automodCfg.exempt_channels) ? [...automodCfg.exempt_channels.map(String)] : [],

      // Logging categories
      logging: {
        msg_channel: logsCfg.channels?.message_deleted || logsCfg.channels?.message_edited || '',
        msg_edits: Boolean(logsCfg.categories?.message_edited),
        msg_deletes: Boolean(logsCfg.categories?.message_deleted),

        member_channel: logsCfg.channels?.member_joined || logsCfg.channels?.member_left || '',
        member_joins: Boolean(logsCfg.categories?.member_joined),
        member_leaves: Boolean(logsCfg.categories?.member_left),

        voice_channel: logsCfg.channels?.member_joined_voice || '',
        voice_activity: Boolean(logsCfg.categories?.member_joined_voice),

        mod_channel: logsCfg.channels?.moderation_action || '',
        ignored_channels: Array.isArray(logsCfg.global_exempt_channels) ? [...logsCfg.global_exempt_channels.map(String)] : []
      },

      // DM Notifications
      dm_notifications: {
        warn_dm: automodCfg.dm_notifications?.warn_dm !== false,
        timeout_dm: automodCfg.dm_notifications?.timeout_dm !== false,
        kick_dm: automodCfg.dm_notifications?.kick_dm !== false,
        ban_dm: automodCfg.dm_notifications?.ban_dm !== false
      },

      // Warnings Query
      warningSearchUser: '',
      warningResults: null,
      isSearchingWarnings: false
    };

    if (state.spam_messages >= 8) state.spam_sensitivity = 'relaxed';
    else if (state.spam_messages <= 3) state.spam_sensitivity = 'strict';
    else state.spam_sensitivity = 'normal';

    // Helper: Build Custom Single Channel Selector Dropdown
    function renderCustomChannelSelect(ddId, selectedId, placeholder = 'Select channel') {
      const selectedCh = textChannels.find(c => String(c.id) === String(selectedId));
      const hasVal = Boolean(selectedCh);
      const label = selectedCh ? selectedCh.name : placeholder;

      return `
        <div class="relative w-full custom-channel-dd" data-dd-id="${escapeHtml(ddId)}">
          <button 
            type="button" 
            id="${escapeHtml(ddId)}-trigger"
            class="custom-channel-trigger w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer"
          >
            <span class="truncate flex items-center gap-1.5 text-sm ${hasVal ? 'text-white font-medium' : 'text-neutral-500'}">
              <span class="text-neutral-500">#</span>
              <span class="dd-display-label">${escapeHtml(label)}</span>
            </span>
            <div class="flex items-center gap-1 text-neutral-400">
              ${SVGS.chevronDown}
            </div>
          </button>

          <div 
            id="${escapeHtml(ddId)}-menu"
            class="orbit-dropdown-menu custom-channel-menu hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] overflow-hidden max-h-60 flex flex-col"
            data-lenis-prevent
          >
            <div class="p-2 border-b border-neutral-800 shrink-0">
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">${SVGS.search}</span>
                <input 
                  type="text" 
                  placeholder="Search channel..." 
                  class="channel-search-input w-full pl-8 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" 
                  autocomplete="off"
                />
              </div>
            </div>
            <div class="overflow-y-auto p-1 space-y-0.5 scrollbar-thin channel-options-list">
              <button 
                type="button" 
                data-val="" 
                class="channel-option-btn w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <span>None / Disabled</span>
                ${!hasVal ? `<span class="text-emerald-400 shrink-0">${SVGS.check}</span>` : ''}
              </button>
              ${textChannels.map(c => {
                const isSelected = String(c.id) === String(selectedId);
                return `
                  <button 
                    type="button" 
                    data-val="${c.id}" 
                    data-name="${escapeHtml(c.name)}"
                    class="channel-option-btn w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${isSelected ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'}"
                  >
                    <span class="flex items-center gap-1.5 truncate">
                      <span class="text-neutral-500">#</span>
                      <span class="truncate">${escapeHtml(c.name)}</span>
                    </span>
                    ${isSelected ? `<span class="text-emerald-400 shrink-0">${SVGS.check}</span>` : ''}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // Helper: Build Custom Multi-Select Dropdown (Roles or Channels)
    function renderCustomMultiSelect(ddId, type, selectedIds, placeholder = 'Select...') {
      const isRole = type === 'role';
      const allItems = isRole ? roles : textChannels;
      const selectedItems = selectedIds.map(id => {
        const found = allItems.find(it => String(it.id) === String(id));
        return {
          id: String(id),
          name: found ? found.name : `${type}-${id}`,
          color: isRole && found && found.color && found.color !== 0 ? '#' + found.color.toString(16).padStart(6, '0') : null
        };
      });

      return `
        <div class="relative w-full custom-multi-dd" data-dd-id="${escapeHtml(ddId)}" data-type="${type}">
          <button 
            type="button" 
            id="${escapeHtml(ddId)}-trigger"
            class="custom-multi-trigger w-full flex items-center justify-between gap-2 min-h-[44px] px-3 py-1.5 bg-neutral-800 border rounded-xl text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer"
          >
            <div class="flex-1 flex flex-wrap gap-1.5 py-0.5">
              ${selectedItems.map(item => `
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-200">
                  <span class="text-neutral-500">${isRole ? '@' : '#'}</span>
                  ${item.color ? `<span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${item.color}"></span>` : ''}
                  <span class="truncate max-w-[120px]">${escapeHtml(item.name)}</span>
                  <span class="remove-chip-btn text-neutral-400 hover:text-red-400 p-0.5 cursor-pointer" data-val="${item.id}">${SVGS.x}</span>
                </span>
              `).join('')}
              ${selectedItems.length === 0 ? `<span class="text-neutral-500 text-sm py-0.5">${escapeHtml(placeholder)}</span>` : ''}
            </div>
            <div class="flex items-center gap-1 text-neutral-400 flex-shrink-0">
              ${SVGS.chevronDown}
            </div>
          </button>

          <div 
            id="${escapeHtml(ddId)}-menu"
            class="orbit-dropdown-menu custom-multi-menu hidden absolute left-0 right-0 top-full mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] overflow-hidden max-h-60 flex flex-col"
            data-lenis-prevent
          >
            <div class="p-2 border-b border-neutral-800 shrink-0">
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">${SVGS.search}</span>
                <input 
                  type="text" 
                  placeholder="Search ${isRole ? 'roles' : 'channels'}..." 
                  class="multi-search-input w-full pl-8 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" 
                  autocomplete="off"
                />
              </div>
            </div>
            <div class="overflow-y-auto p-1 space-y-0.5 scrollbar-thin multi-options-list">
              ${allItems.map(it => {
                const isSelected = selectedIds.includes(String(it.id));
                const itemColor = isRole && it.color && it.color !== 0 ? '#' + it.color.toString(16).padStart(6, '0') : null;
                return `
                  <button 
                    type="button" 
                    data-val="${it.id}" 
                    data-name="${escapeHtml(it.name)}"
                    class="multi-option-btn w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${isSelected ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'}"
                  >
                    <span class="flex items-center gap-2 truncate">
                      <span class="text-neutral-500">${isRole ? '@' : '#'}</span>
                      ${itemColor ? `<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${itemColor}"></span>` : ''}
                      <span class="truncate">${escapeHtml(it.name)}</span>
                    </span>
                    ${isSelected ? `<span class="text-emerald-400 shrink-0">${SVGS.check}</span>` : ''}
                  </button>
                `;
              }).join('')}
              ${allItems.length === 0 ? `<div class="p-3 text-xs text-neutral-500 text-center">No ${isRole ? 'roles' : 'channels'} available</div>` : ''}
            </div>
          </div>
        </div>
      `;
    }

    function renderUI() {
      const serverName = escapeHtml(currentGuild.name || 'Server');
      const exemptRolesCount = state.exempt_roles.length;
      const exemptChannelsCount = state.exempt_channels.length;
      const rolePct = Math.min(100, Math.round((exemptRolesCount / 25) * 100));
      const chPct = Math.min(100, Math.round((exemptChannelsCount / 25) * 100));

      const filterLevels = [
        { id: 'relaxed', label: 'Relaxed', bars: [true, false, false, false] },
        { id: 'moderate', label: 'Moderate', bars: [true, true, false, false] },
        { id: 'strict', label: 'Strict', bars: [true, true, true, false] },
        { id: 'maximum', label: 'Maximum', bars: [true, true, true, true] }
      ];

      const sensitivities = [
        { id: 'relaxed', label: 'Relaxed', msgs: 8, sec: 6, bars: [true, false, false] },
        { id: 'normal', label: 'Normal', msgs: 5, sec: 5, bars: [true, true, false] },
        { id: 'strict', label: 'Strict', msgs: 3, sec: 3, bars: [true, true, true] }
      ];

      const actionsCount = modActivity.length;

      container.innerHTML = `
        <main class="p-4 lg:p-6 xl:p-8 max-w-[1200px] mx-auto">
          <div>
            <!-- Feature Header -->
            <div data-tour="feature-header" class="scroll-mt-24">
              <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
                    ${SVGS.shieldAlert}
                  </span>
                  <h1 class="text-base font-medium text-white truncate">Auto-Moderation</h1>
                </div>
                <div class="flex items-center gap-3">
                  <button 
                    type="button" 
                    id="save-automod-top-btn" 
                    class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-all active:scale-95 shadow-sm"
                  >Save Changes</button>
                </div>
              </div>
            </div>

            <!-- Main Grid: Left Config Column (1fr) & Right Activity/Warnings Column (340px) -->
            <div class="mt-6">
              <div class="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-4 lg:items-stretch min-w-0">
                
                <!-- Left Column -->
                <div class="flex flex-col gap-4 min-w-0 scroll-mt-24">

                  <!-- Card 1: Content Filter -->
                  <div data-tour="content-filter" class="scroll-mt-24">
                    <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                      <div class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                        <div class="flex items-center gap-2.5 min-w-0">
                          <span class="flex-shrink-0 transition-colors text-neutral-500">
                            ${SVGS.filter}
                          </span>
                          <span class="text-sm font-medium text-white truncate">Content Filter</span>
                        </div>
                        <div class="flex items-center gap-2.5 flex-shrink-0">
                          ${renderCustomToggle('toggle-content-filter', state.content_filter_enabled, 'Toggle Content Filter')}
                        </div>
                      </div>

                      <div class="p-4 sm:p-5 space-y-5">
                        <!-- Filter level -->
                        <div data-tour="moderation-filter-level" class="scroll-mt-24">
                          <div>
                            <div class="flex items-baseline justify-between gap-3 mb-2">
                              <label class="text-sm font-medium text-neutral-300">Filter level</label>
                              <span class="text-xs text-neutral-500 tabular-nums">${state.banned_words.length} words</span>
                            </div>
                            <div class="grid gap-2" style="grid-template-columns: repeat(4, minmax(0px, 1fr));">
                              ${filterLevels.map(lvl => {
                                const isLvlActive = state.filter_level === lvl.id;
                                return `
                                  <button 
                                    type="button" 
                                    class="filter-level-btn rounded-xl border px-2 py-3 flex flex-col items-center gap-2 transition-[color,background-color,border-color,scale] duration-150 active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15 ${isLvlActive ? 'border-neutral-500 bg-neutral-800/80' : 'border-neutral-800 bg-neutral-800/40 hover:border-neutral-700'}"
                                    data-level="${lvl.id}"
                                  >
                                    <span class="flex items-end gap-[3px] h-4" aria-hidden="true">
                                      <span class="w-1 rounded-full transition-colors ${lvl.bars[0] ? (isLvlActive ? 'bg-white' : 'bg-neutral-500') : 'bg-neutral-700'}" style="height: 7px;"></span>
                                      <span class="w-1 rounded-full transition-colors ${lvl.bars[1] ? (isLvlActive ? 'bg-white' : 'bg-neutral-500') : 'bg-neutral-700'}" style="height: 10px;"></span>
                                      <span class="w-1 rounded-full transition-colors ${lvl.bars[2] ? (isLvlActive ? 'bg-white' : 'bg-neutral-500') : 'bg-neutral-700'}" style="height: 13px;"></span>
                                      <span class="w-1 rounded-full transition-colors ${lvl.bars[3] ? (isLvlActive ? 'bg-white' : 'bg-neutral-500') : 'bg-neutral-700'}" style="height: 16px;"></span>
                                    </span>
                                    <span class="text-[13px] font-medium leading-none ${isLvlActive ? 'text-white' : 'text-neutral-400'}">${lvl.label}</span>
                                  </button>
                                `;
                              }).join('')}
                            </div>
                          </div>
                        </div>

                        <!-- When a match is found -->
                        <div data-tour="moderation-content-action" class="scroll-mt-24">
                          <div>
                            <div class="flex items-baseline justify-between gap-3 mb-2">
                              <label class="text-sm font-medium text-neutral-300">When a match is found</label>
                            </div>
                            <div class="space-y-3">
                              ${renderActionPills('content_action', state.content_action)}
                            </div>
                          </div>
                        </div>

                        <!-- Edit Word List Accordion -->
                        <div>
                          <button 
                            type="button" 
                            id="toggle-word-list-accordion" 
                            class="flex items-center justify-between w-full min-h-[44px] py-2 text-left group rounded-lg transition-[scale] duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer"
                          >
                            <span class="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">Edit word list</span>
                            <span class="flex items-center gap-2 text-xs text-neutral-500">
                              <span id="banned-words-count">${state.banned_words.length} words</span>
                              <span class="transition-transform duration-200 ease-out ${state.word_list_open ? 'rotate-180' : ''}">
                                ${SVGS.chevronDown}
                              </span>
                            </span>
                          </button>

                          <div id="word-list-drawer" class="${state.word_list_open ? 'block' : 'hidden'} pt-2 space-y-3">
                            <div class="flex gap-2">
                              <input 
                                type="text" 
                                id="new-banned-word-input" 
                                placeholder="Add word or phrase to block..." 
                                class="flex-1 h-10 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 outline-none hover:border-neutral-600 transition-colors focus:border-neutral-600 focus:ring-2 focus:ring-white/10"
                              />
                              <button 
                                type="button" 
                                id="add-banned-word-btn" 
                                class="h-10 px-4 bg-neutral-700 text-neutral-200 text-sm font-medium rounded-xl hover:bg-neutral-600 transition-all active:scale-[0.96] flex-shrink-0 cursor-pointer"
                              >Add</button>
                            </div>
                            <div class="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-neutral-950/50 rounded-xl border border-neutral-800" id="banned-words-chips">
                              ${state.banned_words.map((w, i) => `
                                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-200">
                                  ${escapeHtml(w)}
                                  <button type="button" class="remove-banned-word-btn text-neutral-400 hover:text-red-400" data-idx="${i}">
                                    ${SVGS.x}
                                  </button>
                                </span>
                              `).join('')}
                              ${state.banned_words.length === 0 ? `<span class="text-xs text-neutral-500 italic p-1">No custom words added yet.</span>` : ''}
                            </div>
                          </div>
                        </div>

                        <!-- Always allow these words -->
                        <div>
                          <div class="flex items-baseline justify-between gap-3 mb-2">
                            <label class="text-sm font-medium text-neutral-300">Always allow these words</label>
                            <span class="text-xs text-neutral-500 tabular-nums">${state.allowed_words.length} words</span>
                          </div>
                          <div class="space-y-2.5">
                            <div class="flex gap-2">
                              <input 
                                type="text" 
                                id="new-allowed-word-input" 
                                placeholder="Add a word that should never be filtered..." 
                                class="flex-1 h-10 px-3 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 outline-none hover:border-neutral-600 transition-[border-color,box-shadow] duration-150 ease-out focus:border-neutral-600 focus:ring-2 focus:ring-white/10" 
                              />
                              <button 
                                type="button" 
                                id="add-allowed-word-btn" 
                                class="h-10 px-4 bg-neutral-700 text-neutral-200 text-sm font-medium rounded-xl hover:bg-neutral-600 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 flex-shrink-0 cursor-pointer"
                              >Add</button>
                            </div>
                            <div class="flex flex-wrap gap-1.5" id="allowed-words-chips">
                              ${state.allowed_words.map((w, i) => `
                                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-200">
                                  ${escapeHtml(w)}
                                  <button type="button" class="remove-allowed-word-btn text-neutral-400 hover:text-red-400 cursor-pointer" data-idx="${i}">
                                    ${SVGS.x}
                                  </button>
                                </span>
                              `).join('')}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  <!-- Card 4: Spam Protection -->
                  <div data-tour="moderation-spam" class="scroll-mt-24">
                    <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                      <div class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                        <div class="flex items-center gap-2.5 min-w-0">
                          <span class="flex-shrink-0 transition-colors text-neutral-500">
                            ${SVGS.zap}
                          </span>
                          <span class="text-sm font-medium text-white truncate">Spam Protection</span>
                        </div>
                        <div class="flex items-center gap-2.5 flex-shrink-0">
                          ${renderCustomToggle('toggle-spam', state.spam_enabled, 'Toggle Spam Protection')}
                        </div>
                      </div>

                      <div class="p-4 sm:p-5 space-y-5">
                        <!-- Dynamic Info Banner -->
                        <div class="rounded-xl bg-neutral-800/40 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] px-4 py-3.5 flex items-center gap-2.5">
                          <span class="text-blue-400 flex-shrink-0">${SVGS.zap}</span>
                          <p class="text-sm text-neutral-200 leading-snug text-pretty">
                            Catches a member sending <span class="font-semibold text-white tabular-nums" id="spam-banner-msgs">${state.spam_messages}</span> messages in <span class="font-semibold text-white tabular-nums" id="spam-banner-sec">${state.spam_time_sec}s</span>
                          </p>
                        </div>

                        <!-- Sensitivity Buttons -->
                        <div>
                          <div class="flex items-baseline justify-between gap-3 mb-2">
                            <label class="text-sm font-medium text-neutral-300">Sensitivity</label>
                          </div>
                          <div class="grid gap-2" style="grid-template-columns: repeat(3, minmax(0px, 1fr));">
                            ${sensitivities.map(s => {
                              const isSensActive = state.spam_sensitivity === s.id;
                              return `
                                <button 
                                  type="button" 
                                  class="spam-sensitivity-btn rounded-xl border px-2 py-3 flex flex-col items-center gap-2 transition-[color,background-color,border-color,scale] duration-150 active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15 cursor-pointer ${isSensActive ? 'border-blue-500/50 bg-blue-500/10' : 'border-neutral-800 bg-neutral-800/40 hover:border-neutral-700'}"
                                  data-sens="${s.id}"
                                  data-msgs="${s.msgs}"
                                  data-sec="${s.sec}"
                                >
                                  <span class="flex items-end gap-[3px] h-4" aria-hidden="true">
                                    <span class="w-1 rounded-full transition-colors ${s.bars[0] ? (isSensActive ? 'bg-blue-400' : 'bg-neutral-500') : 'bg-neutral-700'}" style="height: 7px;"></span>
                                    <span class="w-1 rounded-full transition-colors ${s.bars[1] ? (isSensActive ? 'bg-blue-400' : 'bg-neutral-500') : 'bg-neutral-700'}" style="height: 11.5px;"></span>
                                    <span class="w-1 rounded-full transition-colors ${s.bars[2] ? (isSensActive ? 'bg-blue-400' : 'bg-neutral-500') : 'bg-neutral-700'}" style="height: 16px;"></span>
                                  </span>
                                  <span class="text-[13px] font-medium leading-none ${isSensActive ? 'text-white' : 'text-neutral-400'}">${s.label}</span>
                                </button>
                              `;
                            }).join('')}
                          </div>
                        </div>

                        <!-- Numeric inputs -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div class="flex items-baseline justify-between gap-3 mb-2">
                              <label class="text-sm font-medium text-neutral-300">Messages</label>
                            </div>
                            <div class="flex items-center h-10 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl transition-[border-color,box-shadow,opacity] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10">
                              <input 
                                min="2" 
                                max="20" 
                                id="input-spam-messages"
                                autocomplete="off" 
                                class="h-full w-full bg-transparent px-3 text-sm text-white outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                type="number" 
                                value="${state.spam_messages}"
                              />
                              <span class="pr-3 text-xs font-medium text-neutral-500 flex-shrink-0 select-none">msgs</span>
                            </div>
                          </div>
                          <div>
                            <div class="flex items-baseline justify-between gap-3 mb-2">
                              <label class="text-sm font-medium text-neutral-300">Time Window</label>
                            </div>
                            <div class="flex items-center h-10 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl transition-[border-color,box-shadow,opacity] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10">
                              <input 
                                min="1" 
                                max="60" 
                                id="input-spam-sec"
                                autocomplete="off" 
                                class="h-full w-full bg-transparent px-3 text-sm text-white outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                type="number" 
                                value="${state.spam_time_sec}"
                              />
                              <span class="pr-3 text-xs font-medium text-neutral-500 flex-shrink-0 select-none">sec</span>
                            </div>
                          </div>
                        </div>

                        <!-- When triggered -->
                        <div>
                          <div class="flex items-baseline justify-between gap-3 mb-2">
                            <label class="text-sm font-medium text-neutral-300">When triggered</label>
                          </div>
                          <div class="space-y-3">
                            ${renderActionPills('spam_action', state.spam_action)}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  <!-- Card 5: Link Filter -->
                  <div data-tour="moderation-links" class="relative scroll-mt-24">
                    <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                      <div class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                        <div class="flex items-center gap-2.5 min-w-0">
                          <span class="flex-shrink-0 transition-colors text-neutral-500">
                            ${SVGS.link2}
                          </span>
                          <span class="text-sm font-medium text-white truncate">Link Filter</span>
                        </div>
                        <div class="flex items-center gap-2.5 flex-shrink-0">
                          ${renderCustomToggle('toggle-links', state.links_enabled, 'Toggle Link Filter')}
                        </div>
                      </div>

                      <div class="divide-y divide-neutral-800/60">
                        <!-- Sub-toggle 1: Block invites -->
                        <div class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
                          <div class="min-w-0">
                            <span class="text-sm text-neutral-200">Block Discord invites</span>
                            <p class="text-xs text-neutral-600 mt-0.5 leading-relaxed">Removes discord.gg / discord.com invite links</p>
                          </div>
                          <div class="flex-shrink-0">
                            ${renderCustomToggle('toggle-block-invites', state.block_invites, 'Block Discord invites')}
                          </div>
                        </div>

                        <!-- Sub-toggle 2: Allow media -->
                        <div class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
                          <div class="min-w-0">
                            <span class="text-sm text-neutral-200">Allow Discord media</span>
                            <p class="text-xs text-neutral-600 mt-0.5 leading-relaxed">Let Discord CDN images &amp; attachments through</p>
                          </div>
                          <div class="flex-shrink-0">
                            ${renderCustomToggle('toggle-allow-media', state.allow_media, 'Allow Discord media')}
                          </div>
                        </div>

                        <!-- Sub-toggle 3: Allow GIFs -->
                        <div class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
                          <div class="min-w-0">
                            <span class="text-sm text-neutral-200">Allow GIFs</span>
                            <p class="text-xs text-neutral-600 mt-0.5 leading-relaxed">Let Tenor &amp; Giphy GIF links through</p>
                          </div>
                          <div class="flex-shrink-0">
                            ${renderCustomToggle('toggle-allow-gifs', state.allow_gifs, 'Allow GIFs')}
                          </div>
                        </div>
                      </div>

                      <div class="p-4 sm:p-5 space-y-5 border-t border-neutral-800">
                        <div>
                          <div class="flex items-baseline justify-between gap-3 mb-2">
                            <label class="text-sm font-medium text-neutral-300">When a link is blocked</label>
                          </div>
                          <div class="space-y-3">
                            ${renderActionPills('link_action', state.link_action)}
                          </div>
                        </div>

                        <!-- Domain tags -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div class="flex items-baseline justify-between gap-3 mb-2">
                              <label class="text-sm font-medium text-neutral-300">Always allowed</label>
                            </div>
                            <div class="flex flex-wrap items-center gap-1.5 min-h-[40px] px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl cursor-text hover:border-neutral-600 transition-[border-color] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10" id="allowed-domains-wrap">
                              ${state.allowed_domains.map((d, i) => `
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-xs text-neutral-300">
                                  ${escapeHtml(d)}
                                  <button type="button" class="remove-allowed-domain-btn text-neutral-500 hover:text-red-400 cursor-pointer" data-idx="${i}">${SVGS.x}</button>
                                </span>
                              `).join('')}
                              <input 
                                id="new-allowed-domain-input"
                                placeholder="${state.allowed_domains.length === 0 ? 'youtube.com, twitter.com...' : 'Add domain...'}" 
                                autocomplete="off" 
                                class="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none shadow-none py-0.5" 
                              />
                            </div>
                          </div>
                          <div>
                            <div class="flex items-baseline justify-between gap-3 mb-2">
                              <label class="text-sm font-medium text-neutral-300">Always blocked</label>
                            </div>
                            <div class="flex flex-wrap items-center gap-1.5 min-h-[40px] px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl cursor-text hover:border-neutral-600 transition-[border-color] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10" id="blocked-domains-wrap">
                              ${state.blocked_domains.map((d, i) => `
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-xs text-neutral-300">
                                  ${escapeHtml(d)}
                                  <button type="button" class="remove-blocked-domain-btn text-neutral-500 hover:text-red-400 cursor-pointer" data-idx="${i}">${SVGS.x}</button>
                                </span>
                              `).join('')}
                              <input 
                                id="new-blocked-domain-input"
                                placeholder="${state.blocked_domains.length === 0 ? 'spam-site.com...' : 'Add domain...'}" 
                                autocomplete="off" 
                                class="flex-1 min-w-[80px] bg-transparent text-sm text-white placeholder-neutral-500 outline-none border-none shadow-none py-0.5" 
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>

                <!-- Right Column (Recent Actions & Warnings) -->
                <div class="lg:relative flex flex-col">
                  <div class="flex flex-col gap-4 lg:absolute lg:inset-0">

                    <!-- Recent actions -->
                    <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col lg:flex-1 lg:min-h-0">
                      <div class="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-neutral-800">
                        <div class="flex items-center gap-2">
                          <span class="text-neutral-400">${SVGS.gavel}</span>
                          <span class="text-sm font-medium text-white">Recent actions</span>
                        </div>
                        <span class="text-xs text-neutral-600 tabular-nums">${actionsCount} total</span>
                      </div>
                      <div class="flex flex-col lg:flex-1 lg:min-h-0">
                        <div class="divide-y divide-neutral-800/40 overflow-y-auto scrollbar-thin max-h-[420px] lg:max-h-none lg:flex-1 lg:min-h-0" id="recent-actions-list">
                          ${actionsCount > 0 ? modActivity.map(act => {
                            const actType = (act.action || 'warn').toLowerCase();
                            let badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                            let iconSvg = SVGS.alertTriangle;
                            if (actType.includes('ban')) {
                              badgeClass = 'bg-red-500/10 text-red-400 border-red-500/20';
                              iconSvg = SVGS.ban;
                            } else if (actType.includes('kick')) {
                              badgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                              iconSvg = SVGS.doorOpen;
                            } else if (actType.includes('timeout') || actType.includes('mute')) {
                              badgeClass = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
                              iconSvg = SVGS.timer;
                            }

                            return `
                              <div class="flex items-start gap-3 px-4 sm:px-5 py-3 hover:bg-neutral-800/20 transition-[background-color] duration-150 ease-out">
                                <div class="grid place-items-center w-8 h-8 rounded-lg bg-amber-500/10 flex-shrink-0 mt-0.5">
                                  ${iconSvg}
                                </div>
                                <div class="flex-1 min-w-0">
                                  <div class="flex items-center gap-2">
                                    <span class="text-sm text-white font-medium truncate">${escapeHtml(act.target_name || act.target_id || 'User')}</span>
                                    <span class="px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider tabular-nums border ${badgeClass}">
                                      ${escapeHtml(actType)}
                                    </span>
                                  </div>
                                  <p class="text-xs text-neutral-500 mt-1 truncate">${escapeHtml(act.reason || 'No reason provided')}</p>
                                </div>
                                <span class="text-[10px] text-neutral-600 tabular-nums flex-shrink-0 mt-1.5">${formatRelativeTime(act.timestamp)}</span>
                              </div>
                            `;
                          }).join('') : `
                            <div class="p-6 text-center text-xs text-neutral-500 flex flex-col items-center justify-center h-full">
                              <span class="opacity-30 mb-2">${SVGS.gavel}</span>
                              No recent moderation actions recorded.
                            </div>
                          `}
                        </div>
                      </div>
                    </div>

                    <!-- Warnings (Verwarnungen) -->
                    <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col lg:flex-1 lg:min-h-0">
                      <div class="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-neutral-800">
                        <span class="text-amber-400">${SVGS.alertTriangle}</span>
                        <span class="text-sm font-medium text-white">Warnings</span>
                      </div>
                      <div class="px-4 sm:px-5 py-3 border-b border-neutral-800/60">
                        <div class="flex gap-2">
                          <div class="w-full">
                            <div class="relative">
                              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500">
                                ${SVGS.search}
                              </div>
                              <input 
                                id="warning-search-input"
                                autocomplete="off" 
                                class="w-full px-4 py-3 sm:py-2.5 bg-white dark:bg-neutral-800 border rounded-xl text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 transition-all duration-200 focus:outline-none border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 pl-11 text-xs" 
                                placeholder="Discord user ID..." 
                                value="${escapeHtml(state.warningSearchUser)}"
                              />
                            </div>
                          </div>
                          <button 
                            type="button" 
                            id="warning-search-btn"
                            class="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out enabled:active:scale-[0.96] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 focus:ring-neutral-400/20 px-3.5 py-2 text-xs cursor-pointer"
                          >Search</button>
                        </div>
                      </div>
                      <div class="h-[440px] lg:h-auto lg:flex-1 lg:min-h-0 overflow-y-auto scrollbar-thin flex flex-col" id="warning-results-box">
                        ${renderWarningResults()}
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>

            <!-- Bottom Section: General Settings, Exemptions, Logging, DMs -->
            <div data-tour="moderation-actions" class="mt-5 pt-5 border-t border-neutral-800 space-y-4 scroll-mt-24">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

                <!-- General Settings -->
                <div data-tour="moderation-log" class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] scroll-mt-24">
                  <div class="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-neutral-800">
                    <span class="text-neutral-400">${SVGS.settings}</span>
                    <span class="text-sm font-medium text-white">General settings</span>
                  </div>
                  <div class="divide-y divide-neutral-800/60">
                    <!-- Log Channel (Custom Dropdown) -->
                    <div class="px-4 sm:px-5 py-3">
                      <label class="text-sm text-neutral-200 block mb-2">Log Channel</label>
                      ${renderCustomChannelSelect('select-log-channel', state.log_channel, 'Select log channel')}
                    </div>

                    <!-- Caps Filter -->
                    <div class="px-4 sm:px-5 py-3">
                      <div class="flex items-center justify-between">
                        <label class="text-sm text-neutral-200">Caps filter</label>
                        <div class="flex items-center gap-3">
                          ${renderCustomToggle('toggle-caps-filter', state.caps_filter_enabled, 'Toggle Caps filter')}
                        </div>
                      </div>
                      <div class="mt-3 ${state.caps_filter_enabled ? '' : 'pointer-events-none opacity-50'}">
                        <div class="flex items-center h-10 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl transition-[border-color,box-shadow,opacity] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10 ${state.caps_filter_enabled ? '' : 'opacity-50 cursor-not-allowed'}">
                          <input 
                            min="50" 
                            max="100" 
                            id="input-caps-percent"
                            ${state.caps_filter_enabled ? '' : 'disabled'}
                            autocomplete="off" 
                            class="h-full w-full bg-transparent px-3 text-sm text-white outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                            type="number" 
                            value="${state.caps_percent}"
                          />
                          <span class="pr-3 text-xs font-medium text-neutral-500 flex-shrink-0 select-none">% caps</span>
                        </div>
                      </div>
                    </div>

                    <!-- Max Mentions -->
                    <div class="px-4 sm:px-5 py-3">
                      <label class="text-sm text-neutral-200 block mb-2">Max mentions</label>
                      <div class="flex items-center h-10 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl transition-[border-color,box-shadow,opacity] duration-150 ease-out focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-white/10">
                        <input 
                          min="0" 
                          max="50" 
                          id="input-max-mentions"
                          autocomplete="off" 
                          class="h-full w-full bg-transparent px-3 text-sm text-white outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                          type="number" 
                          value="${state.max_mentions}"
                        />
                        <span class="pr-3 text-xs font-medium text-neutral-500 flex-shrink-0 select-none">per msg</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Exemptions -->
                <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                  <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 sm:px-5 py-3 border-b border-neutral-800">
                    <div class="flex items-center gap-2">
                      <span class="text-neutral-400">${SVGS.shield}</span>
                      <span class="text-sm font-medium text-white">Exemptions</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      <div class="flex items-center gap-3">
                        <span class="text-xs tabular-nums text-neutral-500">${exemptRolesCount}/25 Roles</span>
                        <div class="w-16 h-1 rounded-full bg-neutral-800 overflow-hidden">
                          <div class="h-full rounded-full transition-all bg-white/60" style="width: ${rolePct}%;"></div>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="text-xs tabular-nums text-neutral-500">${exemptChannelsCount}/25 Channels</span>
                        <div class="w-16 h-1 rounded-full bg-neutral-800 overflow-hidden">
                          <div class="h-full rounded-full transition-all bg-white/60" style="width: ${chPct}%;"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="p-4 sm:p-5 space-y-4">
                    <!-- Exempt Roles (Custom Multi-Select) -->
                    <div>
                      <label class="text-sm text-neutral-200 block mb-2">Exempt Roles</label>
                      ${renderCustomMultiSelect('exempt-roles-dd', 'role', state.exempt_roles, 'Select roles...')}
                    </div>

                    <!-- Exempt Channels (Custom Multi-Select) -->
                    <div>
                      <label class="text-sm text-neutral-200 block mb-2">Exempt Channels</label>
                      ${renderCustomMultiSelect('exempt-channels-dd', 'channel', state.exempt_channels, 'Select channels...')}
                    </div>
                  </div>
                </div>

              </div>

              <!-- Logging System -->
              <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <div class="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <span class="text-neutral-400">${SVGS.messageSquare}</span>
                  <span class="text-sm font-medium text-white">Logging</span>
                </div>

                <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <!-- Category 1: Message Logs (Custom Dropdown) -->
                  <div class="space-y-3">
                    <div class="flex items-center gap-2">
                      <span class="text-blue-400">${SVGS.messageSquare}</span>
                      <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Message Logs</span>
                    </div>
                    <div>
                      ${renderCustomChannelSelect('select-log-msg-ch', state.logging.msg_channel, 'Select channel')}
                    </div>
                    <div class="flex gap-5">
                      <label class="flex items-center gap-2 cursor-pointer">
                        ${renderCustomToggle('toggle-log-msg-edits', state.logging.msg_edits, 'Message edits')}
                        <span class="flex items-center gap-1.5 text-xs text-neutral-400">
                          <span class="text-neutral-500">${SVGS.pencil}</span>Edits
                        </span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer">
                        ${renderCustomToggle('toggle-log-msg-deletes', state.logging.msg_deletes, 'Message deletes')}
                        <span class="flex items-center gap-1.5 text-xs text-neutral-400">
                          <span class="text-neutral-500">${SVGS.trash2}</span>Deletes
                        </span>
                      </label>
                    </div>
                  </div>

                  <!-- Category 2: Member Logs (Custom Dropdown) -->
                  <div class="space-y-3">
                    <div class="flex items-center gap-2">
                      ${SVGS.users}
                      <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Member Logs</span>
                    </div>
                    <div>
                      ${renderCustomChannelSelect('select-log-member-ch', state.logging.member_channel, 'Select channel')}
                    </div>
                    <div class="flex gap-5">
                      <label class="flex items-center gap-2 cursor-pointer">
                        ${renderCustomToggle('toggle-log-member-joins', state.logging.member_joins, 'Member joins')}
                        <span class="flex items-center gap-1.5 text-xs text-neutral-400">
                          ${SVGS.logIn}Joins
                        </span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer">
                        ${renderCustomToggle('toggle-log-member-leaves', state.logging.member_leaves, 'Member leaves')}
                        <span class="flex items-center gap-1.5 text-xs text-neutral-400">
                          ${SVGS.logOut}Leaves
                        </span>
                      </label>
                    </div>
                  </div>

                  <!-- Category 3: Voice Logs (Custom Dropdown) -->
                  <div class="space-y-3">
                    <div class="flex items-center gap-2">
                      ${SVGS.mic}
                      <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Voice Logs</span>
                      <span class="inline-flex items-center justify-center font-semibold uppercase tracking-[0.04em] leading-none tabular-nums select-none border align-middle whitespace-nowrap translate-y-px shadow-[0_1px_2px_-0.5px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] text-emerald-400 border-emerald-500/20 bg-gradient-to-b from-emerald-400/25 to-emerald-600/10 h-[19px] pl-[5px] pr-[6.5px] gap-[3px] rounded-[6px] text-[9.5px]">
                        Starter
                      </span>
                    </div>
                    <div>
                      ${renderCustomChannelSelect('select-log-voice-ch', state.logging.voice_channel, 'Select channel')}
                    </div>
                    <label class="flex items-center gap-2 cursor-pointer">
                      ${renderCustomToggle('toggle-log-voice-act', state.logging.voice_activity, 'Log voice activity')}
                      <span class="text-xs text-neutral-400">Log voice activity</span>
                    </label>
                  </div>

                  <!-- Category 4: Mod Action Logs (Custom Dropdown) -->
                  <div class="space-y-3">
                    <div class="flex items-center gap-2">
                      <span class="text-red-400">${SVGS.gavel}</span>
                      <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Mod Action Logs</span>
                    </div>
                    <div>
                      ${renderCustomChannelSelect('select-log-mod-ch', state.logging.mod_channel, 'Select channel')}
                    </div>
                    <p class="text-xs text-neutral-600 leading-relaxed text-pretty">Warnings, bans, kicks, timeouts &amp; unbans</p>
                  </div>
                </div>

                <!-- Ignored Channels (Custom Multi-Select) -->
                <div class="px-4 sm:px-5 py-4 border-t border-neutral-800/60">
                  <div class="flex items-center gap-2">
                    <span class="text-neutral-500">${SVGS.eyeOff}</span>
                    <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Ignored Channels</span>
                  </div>
                  <div class="mt-3">
                    ${renderCustomMultiSelect('ignored-channels-dd', 'channel', state.logging.ignored_channels, 'Select channels to exclude...')}
                  </div>
                </div>

              </div>

              <!-- Messages members get (DM Notifications) -->
              <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
                <div class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-indigo-300">${SVGS.mail}</span>
                    <span class="text-sm font-medium text-white">Messages members get</span>
                    <span class="hidden sm:inline text-xs text-neutral-500 truncate">· sent as a DM when you warn, time out, kick or ban</span>
                  </div>
                  <a class="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white flex-shrink-0" href="/dashboard/${guildId}/messages?tab=bot">
                    All bot messages ${SVGS.chevronRight}
                  </a>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 divide-neutral-800/60">
                  
                  <!-- Warn DM -->
                  <div class="flex items-center gap-3 px-4 sm:px-5 py-3 min-w-0 md:border-r md:border-neutral-800/60">
                    <span class="grid place-items-center w-8 h-8 rounded-lg flex-shrink-0 text-amber-300 bg-amber-500/10">
                      ${SVGS.alertTriangle}
                    </span>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <span class="text-[13px] font-semibold text-white">Warn DM</span>
                      </div>
                      <p class="text-[11px] truncate text-neutral-400" title="You received a warning in ${serverName} · A moderator gave you a warning. Please read the server rules so it does not happen again.">
                        You received a warning in ${serverName} · A moderator gave you a warning. Please read the server rules so it does not happen again.
                      </p>
                    </div>
                    <span class="flex-shrink-0 w-11 flex justify-center">
                      ${renderCustomToggle('toggle-warn-dm', state.dm_notifications.warn_dm, 'Warn DM on or off')}
                    </span>
                    <a class="inline-flex items-center h-8 px-3 rounded-lg text-[12px] font-medium text-neutral-200 bg-neutral-800/70 hover:bg-neutral-800 flex-shrink-0" href="/dashboard/${guildId}/embed-builder?slot=moderation.warn_dm&from=moderation">Customize</a>
                  </div>

                  <!-- Timeout DM -->
                  <div class="flex items-center gap-3 px-4 sm:px-5 py-3 min-w-0">
                    <span class="grid place-items-center w-8 h-8 rounded-lg flex-shrink-0 text-orange-300 bg-orange-500/10">
                      ${SVGS.timer}
                    </span>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <span class="text-[13px] font-semibold text-white">Timeout DM</span>
                      </div>
                      <p class="text-[11px] truncate text-neutral-400" title="You were timed out in ${serverName} · You cannot send messages or join voice until the timeout ends.">
                        You were timed out in ${serverName} · You cannot send messages or join voice until the timeout ends.
                      </p>
                    </div>
                    <span class="flex-shrink-0 w-11 flex justify-center">
                      ${renderCustomToggle('toggle-timeout-dm', state.dm_notifications.timeout_dm, 'Timeout DM on or off')}
                    </span>
                    <a class="inline-flex items-center h-8 px-3 rounded-lg text-[12px] font-medium text-neutral-200 bg-neutral-800/70 hover:bg-neutral-800 flex-shrink-0" href="/dashboard/${guildId}/embed-builder?slot=moderation.timeout_dm&from=moderation">Customize</a>
                  </div>

                  <!-- Kick DM -->
                  <div class="flex items-center gap-3 px-4 sm:px-5 py-3 min-w-0 md:border-t md:border-neutral-800/60 md:border-r md:border-neutral-800/60">
                    <span class="grid place-items-center w-8 h-8 rounded-lg flex-shrink-0 text-rose-300 bg-rose-500/10">
                      ${SVGS.doorOpen}
                    </span>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <span class="text-[13px] font-semibold text-white">Kick DM</span>
                      </div>
                      <p class="text-[11px] truncate text-neutral-400" title="You were removed from ${serverName} · A moderator removed you from the server. You can rejoin with an invite, but please read the rules first.">
                        You were removed from ${serverName} · A moderator removed you from the server. You can rejoin with an invite, but please read the rules first.
                      </p>
                    </div>
                    <span class="flex-shrink-0 w-11 flex justify-center">
                      ${renderCustomToggle('toggle-kick-dm', state.dm_notifications.kick_dm, 'Kick DM on or off')}
                    </span>
                    <a class="inline-flex items-center h-8 px-3 rounded-lg text-[12px] font-medium text-neutral-200 bg-neutral-800/70 hover:bg-neutral-800 flex-shrink-0" href="/dashboard/${guildId}/embed-builder?slot=moderation.kick_dm&from=moderation">Customize</a>
                  </div>

                  <!-- Ban DM -->
                  <div class="flex items-center gap-3 px-4 sm:px-5 py-3 min-w-0 md:border-t md:border-neutral-800/60">
                    <span class="grid place-items-center w-8 h-8 rounded-lg flex-shrink-0 text-red-300 bg-red-500/10">
                      ${SVGS.ban}
                    </span>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-2">
                        <span class="text-[13px] font-semibold text-white">Ban DM</span>
                      </div>
                      <p class="text-[11px] truncate text-neutral-400" title="You were banned from ${serverName} · A moderator banned you from the server.">
                        You were banned from ${serverName} · A moderator banned you from the server.
                      </p>
                    </div>
                    <span class="flex-shrink-0 w-11 flex justify-center">
                      ${renderCustomToggle('toggle-ban-dm', state.dm_notifications.ban_dm, 'Ban DM on or off')}
                    </span>
                    <a class="inline-flex items-center h-8 px-3 rounded-lg text-[12px] font-medium text-neutral-200 bg-neutral-800/70 hover:bg-neutral-800 flex-shrink-0" href="/dashboard/${guildId}/embed-builder?slot=moderation.ban_dm&from=moderation">Customize</a>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </main>
      `;

      attachEventHandlers();
    }

    function renderWarningResults() {
      if (state.isSearchingWarnings) {
        return `
          <div class="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-neutral-500">
            <div class="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3"></div>
            Searching warnings for ${escapeHtml(state.warningSearchUser)}...
          </div>
        `;
      }

      if (state.warningResults === null) {
        return `
          <div class="flex-1 flex flex-col items-center justify-center text-center px-6">
            ${SVGS.searchLg}
            <p class="text-sm text-neutral-600 text-pretty">Enter a user ID to view warnings</p>
          </div>
        `;
      }

      if (state.warningResults.length === 0) {
        return `
          <div class="flex-1 flex flex-col items-center justify-center text-center px-6 py-8">
            <div class="w-10 h-10 rounded-xl bg-neutral-800/50 flex items-center justify-center text-neutral-500 mb-3">
              ${SVGS.alertTriangle}
            </div>
            <p class="text-sm font-medium text-neutral-300">No warnings found</p>
            <p class="text-xs text-neutral-600 mt-1">This user has a clean moderation record.</p>
          </div>
        `;
      }

      return `
        <div class="divide-y divide-neutral-800/40 p-2 space-y-1">
          <div class="flex items-center justify-between px-3 py-1.5 text-xs text-neutral-400">
            <span>${state.warningResults.length} warning(s) found</span>
            <button type="button" id="clear-all-warnings-btn" class="text-red-400 hover:text-red-300 font-medium text-[11px] cursor-pointer">Clear all</button>
          </div>
          ${state.warningResults.map(w => `
            <div class="p-3 bg-neutral-800/30 rounded-xl border border-neutral-800/60 flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-semibold text-amber-400">${escapeHtml(w.id || 'Warning')}</span>
                  <span class="text-[10px] text-neutral-500">by ${escapeHtml(w.mod_name || 'Mod')}</span>
                </div>
                <p class="text-xs text-neutral-300 break-words">${escapeHtml(w.reason || 'No reason provided')}</p>
                <span class="text-[10px] text-neutral-600 block mt-1">${formatRelativeTime(w.timestamp)}</span>
              </div>
              <button 
                type="button" 
                class="delete-single-warn-btn text-neutral-500 hover:text-red-400 p-1 rounded-lg hover:bg-neutral-800 cursor-pointer" 
                data-warn-id="${escapeHtml(w.id)}"
                title="Delete this warning"
              >
                ${SVGS.trash2}
              </button>
            </div>
          `).join('')}
        </div>
      `;
    }

    function closeAllCustomDropdowns() {
      document.querySelectorAll('.custom-channel-menu, .custom-multi-menu').forEach(m => {
        if (!m.classList.contains('hidden')) {
          m.classList.add('hidden');
        }
      });
      document.querySelectorAll('.custom-channel-trigger, .custom-multi-trigger').forEach(btn => {
        const arrow = btn.querySelector('.lucide-chevron-down');
        if (arrow) arrow.classList.remove('rotate-180');
      });
    }

    function attachEventHandlers() {
      // Global outside-click closes all dropdowns
      document.removeEventListener('click', closeAllCustomDropdowns);
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-channel-dd') && !e.target.closest('.custom-multi-dd')) {
          closeAllCustomDropdowns();
        }
      });

      // Top Save Button
      const saveBtn = document.getElementById('save-automod-top-btn');
      if (saveBtn) {
        saveBtn.onclick = async () => {
          saveBtn.disabled = true;
          saveBtn.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span> Saving...`;
          try {
            await saveAutomodConfig();
            showNotify('Auto-Moderation configuration saved successfully!');
          } catch (err) {
            showNotify('Failed to save settings: ' + err.message, 'error');
          } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
          }
        };
      }

      // Switches toggles
      function wireCustomToggle(id, stateKey, subKey = null, cb = null) {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.onclick = () => {
          if (subKey) {
            state[stateKey][subKey] = !state[stateKey][subKey];
          } else {
            state[stateKey] = !state[stateKey];
          }
          if (cb) cb();
          renderUI();
        };
      }

      wireCustomToggle('toggle-content-filter', 'content_filter_enabled');
      wireCustomToggle('toggle-spam', 'spam_enabled');
      wireCustomToggle('toggle-links', 'links_enabled');
      wireCustomToggle('toggle-block-invites', 'block_invites');
      wireCustomToggle('toggle-allow-media', 'allow_media');
      wireCustomToggle('toggle-allow-gifs', 'allow_gifs');
      wireCustomToggle('toggle-caps-filter', 'caps_filter_enabled');

      wireCustomToggle('toggle-log-msg-edits', 'logging', 'msg_edits');
      wireCustomToggle('toggle-log-msg-deletes', 'logging', 'msg_deletes');
      wireCustomToggle('toggle-log-member-joins', 'logging', 'member_joins');
      wireCustomToggle('toggle-log-member-leaves', 'logging', 'member_leaves');
      wireCustomToggle('toggle-log-voice-act', 'logging', 'voice_activity');

      wireCustomToggle('toggle-warn-dm', 'dm_notifications', 'warn_dm');
      wireCustomToggle('toggle-timeout-dm', 'dm_notifications', 'timeout_dm');
      wireCustomToggle('toggle-kick-dm', 'dm_notifications', 'kick_dm');
      wireCustomToggle('toggle-ban-dm', 'dm_notifications', 'ban_dm');

      // Filter level buttons
      document.querySelectorAll('.filter-level-btn').forEach(btn => {
        btn.onclick = () => {
          state.filter_level = btn.getAttribute('data-level');
          renderUI();
        };
      });

      // Action pill buttons
      document.querySelectorAll('.mod-action-pill').forEach(btn => {
        btn.onclick = () => {
          const group = btn.getAttribute('data-group');
          const act = btn.getAttribute('data-action');
          if (group === 'content_action') state.content_action = act;
          else if (group === 'spam_action') state.spam_action = act;
          else if (group === 'link_action') state.link_action = act;
          renderUI();
        };
      });

      // Word list accordion toggle
      const accBtn = document.getElementById('toggle-word-list-accordion');
      if (accBtn) {
        accBtn.onclick = () => {
          state.word_list_open = !state.word_list_open;
          renderUI();
        };
      }

      // Add banned word
      const addBannedBtn = document.getElementById('add-banned-word-btn');
      const addBannedInp = document.getElementById('new-banned-word-input');
      const handleAddBanned = () => {
        const val = addBannedInp?.value?.trim().toLowerCase();
        if (val && !state.banned_words.includes(val)) {
          state.banned_words.push(val);
          renderUI();
        }
      };
      if (addBannedBtn) addBannedBtn.onclick = handleAddBanned;
      if (addBannedInp) {
        addBannedInp.onkeydown = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAddBanned();
          }
        };
      }

      // Remove banned word
      document.querySelectorAll('.remove-banned-word-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.getAttribute('data-idx'));
          state.banned_words.splice(idx, 1);
          renderUI();
        };
      });

      // Add allowed word
      const addAllowedBtn = document.getElementById('add-allowed-word-btn');
      const addAllowedInp = document.getElementById('new-allowed-word-input');
      const handleAddAllowed = () => {
        const val = addAllowedInp?.value?.trim().toLowerCase();
        if (val && !state.allowed_words.includes(val)) {
          state.allowed_words.push(val);
          renderUI();
        }
      };
      if (addAllowedBtn) addAllowedBtn.onclick = handleAddAllowed;
      if (addAllowedInp) {
        addAllowedInp.onkeydown = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAddAllowed();
          }
        };
      }

      // Remove allowed word
      document.querySelectorAll('.remove-allowed-word-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.getAttribute('data-idx'));
          state.allowed_words.splice(idx, 1);
          renderUI();
        };
      });

      // Spam sensitivity preset buttons
      document.querySelectorAll('.spam-sensitivity-btn').forEach(btn => {
        btn.onclick = () => {
          state.spam_sensitivity = btn.getAttribute('data-sens');
          state.spam_messages = Number(btn.getAttribute('data-msgs')) || 5;
          state.spam_time_sec = Number(btn.getAttribute('data-sec')) || 5;
          renderUI();
        };
      });

      // Spam inputs
      const spamMsgsInp = document.getElementById('input-spam-messages');
      if (spamMsgsInp) {
        spamMsgsInp.oninput = () => {
          state.spam_messages = Math.max(2, Math.min(20, Number(spamMsgsInp.value) || 5));
          const el = document.getElementById('spam-banner-msgs');
          if (el) el.textContent = state.spam_messages;
        };
      }
      const spamSecInp = document.getElementById('input-spam-sec');
      if (spamSecInp) {
        spamSecInp.oninput = () => {
          state.spam_time_sec = Math.max(1, Math.min(60, Number(spamSecInp.value) || 5));
          const el = document.getElementById('spam-banner-sec');
          if (el) el.textContent = `${state.spam_time_sec}s`;
        };
      }

      // Allowed domains input
      const allowedDomInp = document.getElementById('new-allowed-domain-input');
      if (allowedDomInp) {
        allowedDomInp.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = allowedDomInp.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            if (val && !state.allowed_domains.includes(val)) {
              state.allowed_domains.push(val);
              renderUI();
            }
          }
        };
      }
      document.querySelectorAll('.remove-allowed-domain-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.getAttribute('data-idx'));
          state.allowed_domains.splice(idx, 1);
          renderUI();
        };
      });

      // Blocked domains input
      const blockedDomInp = document.getElementById('new-blocked-domain-input');
      if (blockedDomInp) {
        blockedDomInp.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = blockedDomInp.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            if (val && !state.blocked_domains.includes(val)) {
              state.blocked_domains.push(val);
              renderUI();
            }
          }
        };
      }
      document.querySelectorAll('.remove-blocked-domain-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = parseInt(btn.getAttribute('data-idx'));
          state.blocked_domains.splice(idx, 1);
          renderUI();
        };
      });

      // Warnings search
      const warnSearchInp = document.getElementById('warning-search-input');
      const warnSearchBtn = document.getElementById('warning-search-btn');
      const handleWarnSearch = async () => {
        const uId = warnSearchInp?.value?.trim();
        if (!uId) {
          state.warningResults = null;
          state.warningSearchUser = '';
          const box = document.getElementById('warning-results-box');
          if (box) box.innerHTML = renderWarningResults();
          return;
        }
        state.warningSearchUser = uId;
        state.isSearchingWarnings = true;
        const box = document.getElementById('warning-results-box');
        if (box) box.innerHTML = renderWarningResults();

        try {
          const res = await API.getUserWarns(guildId, uId);
          state.warningResults = Array.isArray(res) ? res : [];
        } catch (e) {
          state.warningResults = [];
        } finally {
          state.isSearchingWarnings = false;
          if (box) {
            box.innerHTML = renderWarningResults();
            wireWarningActions();
          }
        }
      };

      if (warnSearchBtn) warnSearchBtn.onclick = handleWarnSearch;
      if (warnSearchInp) {
        warnSearchInp.onkeydown = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleWarnSearch();
          }
        };
      }
      wireWarningActions();

      // Numeric inputs
      const capsInp = document.getElementById('input-caps-percent');
      if (capsInp) {
        capsInp.oninput = () => { state.caps_percent = Math.max(50, Math.min(100, Number(capsInp.value) || 70)); };
      }
      const maxMentionsInp = document.getElementById('input-max-mentions');
      if (maxMentionsInp) {
        maxMentionsInp.oninput = () => { state.max_mentions = Math.max(0, Math.min(50, Number(maxMentionsInp.value) || 5)); };
      }

      // -------------------------------------------------------------
      // WIRE CUSTOM SINGLE-CHANNEL DROPDOWNS
      // -------------------------------------------------------------
      document.querySelectorAll('.custom-channel-dd').forEach(wrap => {
        const ddId = wrap.getAttribute('data-dd-id');
        const trigger = wrap.querySelector('.custom-channel-trigger');
        const menu = wrap.querySelector('.custom-channel-menu');
        const searchInput = wrap.querySelector('.channel-search-input');
        const arrow = trigger?.querySelector('.lucide-chevron-down');

        if (!trigger || !menu) return;

        trigger.onclick = (e) => {
          e.stopPropagation();
          const isHidden = menu.classList.contains('hidden');
          closeAllCustomDropdowns();
          if (isHidden) {
            menu.classList.remove('hidden');
            if (arrow) arrow.classList.add('rotate-180');
            if (searchInput) {
              searchInput.value = '';
              filterChannels('');
              setTimeout(() => searchInput.focus(), 50);
            }
          }
        };

        const filterChannels = (query) => {
          const q = (query || '').toLowerCase().trim();
          menu.querySelectorAll('.channel-option-btn').forEach(btn => {
            const name = (btn.getAttribute('data-name') || '').toLowerCase();
            const val = btn.getAttribute('data-val');
            if (!val) {
              btn.style.display = q ? 'none' : 'flex';
            } else {
              btn.style.display = name.includes(q) ? 'flex' : 'none';
            }
          });
        };

        if (searchInput) {
          searchInput.onclick = (e) => e.stopPropagation();
          searchInput.oninput = (e) => filterChannels(e.target.value);
        }

        menu.querySelectorAll('.channel-option-btn').forEach(btn => {
          btn.onclick = (e) => {
            e.stopPropagation();
            const val = btn.getAttribute('data-val') || '';
            if (ddId === 'select-log-channel') state.log_channel = val;
            else if (ddId === 'select-log-msg-ch') state.logging.msg_channel = val;
            else if (ddId === 'select-log-member-ch') state.logging.member_channel = val;
            else if (ddId === 'select-log-voice-ch') state.logging.voice_channel = val;
            else if (ddId === 'select-log-mod-ch') state.logging.mod_channel = val;
            closeAllCustomDropdowns();
            renderUI();
          };
        });
      });

      // -------------------------------------------------------------
      // WIRE CUSTOM MULTI-SELECT DROPDOWNS (Roles & Channels)
      // -------------------------------------------------------------
      document.querySelectorAll('.custom-multi-dd').forEach(wrap => {
        const ddId = wrap.getAttribute('data-dd-id');
        const trigger = wrap.querySelector('.custom-multi-trigger');
        const menu = wrap.querySelector('.custom-multi-menu');
        const searchInput = wrap.querySelector('.multi-search-input');
        const arrow = trigger?.querySelector('.lucide-chevron-down');

        if (!trigger || !menu) return;

        trigger.onclick = (e) => {
          // If clicked a chip's remove button, don't open
          if (e.target.closest('.remove-chip-btn')) return;
          e.stopPropagation();
          const isHidden = menu.classList.contains('hidden');
          closeAllCustomDropdowns();
          if (isHidden) {
            menu.classList.remove('hidden');
            if (arrow) arrow.classList.add('rotate-180');
            if (searchInput) {
              searchInput.value = '';
              filterMulti('');
              setTimeout(() => searchInput.focus(), 50);
            }
          }
        };

        const filterMulti = (query) => {
          const q = (query || '').toLowerCase().trim();
          menu.querySelectorAll('.multi-option-btn').forEach(btn => {
            const name = (btn.getAttribute('data-name') || '').toLowerCase();
            btn.style.display = name.includes(q) ? 'flex' : 'none';
          });
        };

        if (searchInput) {
          searchInput.onclick = (e) => e.stopPropagation();
          searchInput.oninput = (e) => filterMulti(e.target.value);
        }

        // Toggle item selection
        menu.querySelectorAll('.multi-option-btn').forEach(btn => {
          btn.onclick = (e) => {
            e.stopPropagation();
            const val = btn.getAttribute('data-val');
            if (!val) return;

            let targetArr = null;
            if (ddId === 'exempt-roles-dd') targetArr = state.exempt_roles;
            else if (ddId === 'exempt-channels-dd') targetArr = state.exempt_channels;
            else if (ddId === 'ignored-channels-dd') targetArr = state.logging.ignored_channels;

            if (targetArr) {
              const idx = targetArr.indexOf(String(val));
              if (idx > -1) {
                targetArr.splice(idx, 1);
              } else {
                targetArr.push(String(val));
              }
            }
            renderUI();
          };
        });

        // Remove item chip click
        wrap.querySelectorAll('.remove-chip-btn').forEach(xBtn => {
          xBtn.onclick = (e) => {
            e.stopPropagation();
            const val = xBtn.getAttribute('data-val');
            if (!val) return;

            let targetArr = null;
            if (ddId === 'exempt-roles-dd') targetArr = state.exempt_roles;
            else if (ddId === 'exempt-channels-dd') targetArr = state.exempt_channels;
            else if (ddId === 'ignored-channels-dd') targetArr = state.logging.ignored_channels;

            if (targetArr) {
              const idx = targetArr.indexOf(String(val));
              if (idx > -1) {
                targetArr.splice(idx, 1);
                renderUI();
              }
            }
          };
        });
      });
    }

    function wireWarningActions() {
      // Delete single warning
      document.querySelectorAll('.delete-single-warn-btn').forEach(btn => {
        btn.onclick = async () => {
          const wid = btn.getAttribute('data-warn-id');
          if (!wid || !state.warningSearchUser) return;
          try {
            await API.deleteWarning(guildId, state.warningSearchUser, wid);
            showNotify('Warning deleted');
            state.warningResults = state.warningResults.filter(w => w.id !== wid);
            const box = document.getElementById('warning-results-box');
            if (box) {
              box.innerHTML = renderWarningResults();
              wireWarningActions();
            }
          } catch (err) {
            showNotify('Failed to delete warning: ' + err.message, 'error');
          }
        };
      });

      // Clear all warnings
      const clearAllBtn = document.getElementById('clear-all-warnings-btn');
      if (clearAllBtn) {
        clearAllBtn.onclick = async () => {
          if (!confirm(`Are you sure you want to clear all warnings for user ${state.warningSearchUser}?`)) return;
          try {
            await API.clearUserWarnings(guildId, state.warningSearchUser);
            showNotify('All warnings cleared');
            state.warningResults = [];
            const box = document.getElementById('warning-results-box');
            if (box) {
              box.innerHTML = renderWarningResults();
              wireWarningActions();
            }
          } catch (err) {
            showNotify('Failed to clear warnings: ' + err.message, 'error');
          }
        };
      }
    }

    async function saveAutomodConfig() {
      const automodPayload = {
        enabled: state.content_filter_enabled || state.spam_enabled || state.links_enabled,
        exempt_channels: state.exempt_channels,
        exempt_roles: state.exempt_roles,
        log_channel: state.log_channel,

        banned_words: {
          enabled: state.content_filter_enabled,
          filter_level: state.filter_level,
          action: state.content_action,
          words: state.banned_words,
          allowed_words: state.allowed_words
        },

        anti_spam: {
          enabled: state.spam_enabled,
          max_messages: state.spam_messages,
          time_window_sec: state.spam_time_sec,
          action: state.spam_action
        },

        anti_invites: {
          enabled: state.block_invites,
          action: state.link_action
        },

        anti_link: {
          enabled: state.links_enabled,
          action: state.link_action,
          allow_media: state.allow_media,
          allow_gifs: state.allow_gifs,
          allowed_domains: state.allowed_domains,
          blocked_domains: state.blocked_domains
        },

        anti_caps: {
          enabled: state.caps_filter_enabled,
          percent: state.caps_percent,
          action: 'warn'
        },

        mention_spam: {
          enabled: state.max_mentions > 0,
          max_mentions: state.max_mentions,
          action: 'warn'
        },

        dm_notifications: state.dm_notifications
      };

      const logsPayload = {
        enabled: true,
        global_exempt_channels: state.logging.ignored_channels,
        channels: {
          message_deleted: state.logging.msg_channel || null,
          message_edited: state.logging.msg_channel || null,
          member_joined: state.logging.member_channel || null,
          member_left: state.logging.member_channel || null,
          member_joined_voice: state.logging.voice_channel || null,
          moderation_action: state.logging.mod_channel || null
        },
        categories: {
          message_deleted: state.logging.msg_deletes,
          message_edited: state.logging.msg_edits,
          member_joined: state.logging.member_joins,
          member_left: state.logging.member_leaves,
          member_joined_voice: state.logging.voice_activity,
          moderation_action: Boolean(state.logging.mod_channel)
        }
      };

      await API.saveConfig(guildId, {
        automod: automodPayload,
        logs: logsPayload
      });
    }

    renderUI();
  };

  // Provide renderAutomodModule backward compatibility
  window.renderAutomodModule = function (el, guildId, aCfg, channelOptions, roleOptions) {
    return DashboardTabs.AutoMod(el, guildId);
  };

})();
