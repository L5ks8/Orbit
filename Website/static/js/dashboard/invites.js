/**
 * Orbit Dashboard - Einladungs-Tracker Tab (/dashboard/:guildId/invites)
 * 1:1 PeakBot Einladungs-Tracker UI & Full Functionality
 */

DashboardTabs.Invites = async function (container, guildId) {
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  container.innerHTML = `
    <div class="p-8 flex items-center justify-center min-h-[360px]">
      <div class="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  `;

  let cfgData = {};
  let allChannels = [];
  let allRoles = [];

  try {
    const [cfgRes, chRes, roleRes] = await Promise.allSettled([
      API.getConfig(guildId),
      API.getChannels(guildId),
      API.getRoles(guildId)
    ]);
    if (cfgRes.status === 'fulfilled' && cfgRes.value) {
      cfgData = cfgRes.value?.config?.invites || cfgRes.value?.invites || cfgRes.value?.config?.InviteConfig || {};
      if (Array.isArray(cfgRes.value?.channels) && cfgRes.value.channels.length > 0) {
        allChannels = cfgRes.value.channels;
      }
      if (Array.isArray(cfgRes.value?.roles) && cfgRes.value.roles.length > 0) {
        allRoles = cfgRes.value.roles;
      }
    }
    const chList = chRes.status === 'fulfilled' && (
      Array.isArray(chRes.value) ? chRes.value : (Array.isArray(chRes.value?.channels) ? chRes.value.channels : null)
    );
    if (chList && chList.length > 0) {
      allChannels = chList.filter(
        c => !c.type || c.type === 'text' || c.type === 'news' || c.type === 0 || c.type === 5 || (typeof c.type === 'string' && c.type.includes('text'))
      );
    }
    const rList = roleRes.status === 'fulfilled' && (
      Array.isArray(roleRes.value) ? roleRes.value : (Array.isArray(roleRes.value?.roles) ? roleRes.value.roles : null)
    );
    if (rList && rList.length > 0) {
      allRoles = rList.filter(r => r.name !== '@everyone');
    }
  } catch (err) {
    console.warn('[Invites] Failed to load config:', err);
  }

  const state = {
    enabled: cfgData.enabled !== undefined ? Boolean(cfgData.enabled) : true,
    track_leaves: cfgData.track_leaves !== undefined ? Boolean(cfgData.track_leaves) : true,
    count_rejoins: cfgData.count_rejoins !== undefined ? Boolean(cfgData.count_rejoins) : false,
    show_inviter_count: cfgData.show_inviter_count !== undefined ? Boolean(cfgData.show_inviter_count) : true,
    count_vanity: cfgData.count_vanity !== undefined ? Boolean(cfgData.count_vanity) : false,
    rewards: Array.isArray(cfgData.rewards)
      ? cfgData.rewards.map(r => ({
          invites: Math.max(1, parseInt(r.invites, 10) || 1),
          role_id: String(r.role_id || '')
        })).filter(r => r.role_id)
      : [],
    auto_post: {
      enabled: Boolean(cfgData.auto_post?.enabled),
      channel_id: String(cfgData.auto_post?.channel_id || ''),
      title: String(cfgData.auto_post?.title ?? 'Invite Leaderboard'),
      color: String(cfgData.auto_post?.color || 'rgb(88, 101, 242)'),
      interval: String(cfgData.auto_post?.interval || '1h'),
      top_limit: Number(cfgData.auto_post?.top_limit || 10),
      show_podium: cfgData.auto_post?.show_podium !== undefined ? Boolean(cfgData.auto_post.show_podium) : true,
      show_numbers: cfgData.auto_post?.show_numbers !== undefined ? Boolean(cfgData.auto_post.show_numbers) : true
    },
    sources: Array.isArray(cfgData.sources) ? cfgData.sources : [],
    leaderboard: Array.isArray(cfgData.leaderboard) ? cfgData.leaderboard : []
  };

  // Draft state for adding a reward
  let draftRewardInvites = '';
  let draftRewardRoleId = '';
  let rewardRoleDropdownOpen = false;
  let autoPostChannelDropdownOpen = false;
  let autoPostColorPopoverOpen = false;
  let isPostingLeaderboard = false;

  const PRESET_COLORS = [
    'rgb(88, 101, 242)',
    'rgb(59, 130, 246)',
    'rgb(16, 185, 129)',
    'rgb(245, 158, 11)',
    'rgb(239, 68, 68)',
    'rgb(236, 72, 153)',
    'rgb(168, 85, 247)',
    'rgb(255, 255, 255)'
  ];

  const SOURCE_PRESETS = [
    { name: 'YouTube', color: 'rgb(239, 68, 68)' },
    { name: 'Twitter / X', color: 'rgb(59, 130, 246)' },
    { name: 'Reddit', color: 'rgb(249, 115, 22)' },
    { name: 'TikTok', color: 'rgb(236, 72, 153)' },
    { name: 'Twitch', color: 'rgb(168, 85, 247)' },
    { name: 'Website', color: 'rgb(16, 185, 129)' }
  ];

  let saveTimer = null;
  function scheduleSave(immediate = false) {
    if (saveTimer) clearTimeout(saveTimer);
    const run = async () => {
      try {
        await API.saveConfig(guildId, {
          invites: {
            enabled: state.enabled,
            track_leaves: state.track_leaves,
            count_rejoins: state.count_rejoins,
            show_inviter_count: state.show_inviter_count,
            count_vanity: state.count_vanity,
            rewards: state.rewards,
            auto_post: state.auto_post,
            sources: state.sources
          }
        });
      } catch (err) {
        if (window.Notifications) {
          Notifications.show(err.message || 'Fehler beim Speichern', 'error');
        }
      }
    };
    if (immediate) {
      run();
    } else {
      saveTimer = setTimeout(run, 350);
    }
  }

  function updateSwitchElementInPlace(btn, checked) {
    if (!btn) return;
    btn.setAttribute('aria-checked', checked ? 'true' : 'false');
    if (checked) {
      btn.className = "relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-800 dark:bg-white ";
    } else {
      btn.className = "relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 bg-neutral-200 dark:bg-neutral-700 ";
    }
    const thumb = btn.querySelector('span');
    if (thumb) {
      if (checked) {
        thumb.className = "pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[21px] !bg-white dark:!bg-black";
      } else {
        thumb.className = "pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform translate-x-[3px]";
      }
    }
  }

  function renderSwitchHtml(id, checked) {
    return `
      <button type="button" id="${id}" role="switch" aria-checked="${checked ? 'true' : 'false'}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 ${checked ? 'bg-neutral-800 dark:bg-white ' : 'bg-neutral-200 dark:bg-neutral-700 '}">
        <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${checked ? 'translate-x-[21px] !bg-white dark:!bg-black' : 'translate-x-[3px]'}"></span>
      </button>
    `;
  }

  function renderLeaderboardCardContent() {
    const lb = state.leaderboard || [];
    const PODIUM_THEMES = {
      1: {
        label: 'Gold',
        medal: '👑',
        barClass: 'orbit-podium-gold',
        numClass: 'text-amber-300 drop-shadow-[0_2px_10px_rgba(251,191,36,0.7)]',
        ringClass: 'ring-2 ring-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.5)]',
        badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
        totalClass: 'text-amber-300 font-extrabold',
        subClass: 'text-amber-200/70',
        emptyBarClass: 'orbit-podium-gold opacity-30',
        emptyNumClass: 'text-amber-400/40',
        barHeight: 'h-24 sm:h-28',
        avatarSize: 'w-16 h-16'
      },
      2: {
        label: 'Silber',
        medal: '🥈',
        barClass: 'orbit-podium-silver',
        numClass: 'text-slate-100 drop-shadow-[0_2px_10px_rgba(226,232,240,0.7)]',
        ringClass: 'ring-2 ring-slate-300 shadow-[0_0_16px_rgba(226,232,240,0.4)]',
        badgeBg: 'bg-slate-300/20 text-slate-200 border-slate-300/40',
        totalClass: 'text-slate-100 font-extrabold',
        subClass: 'text-slate-300/70',
        emptyBarClass: 'orbit-podium-silver opacity-30',
        emptyNumClass: 'text-slate-300/40',
        barHeight: 'h-18 sm:h-20',
        avatarSize: 'w-12 h-12'
      },
      3: {
        label: 'Bronze',
        medal: '🥉',
        barClass: 'orbit-podium-bronze',
        numClass: 'text-orange-300 drop-shadow-[0_2px_10px_rgba(249,115,22,0.7)]',
        ringClass: 'ring-2 ring-orange-500 shadow-[0_0_16px_rgba(249,115,22,0.4)]',
        badgeBg: 'bg-orange-600/20 text-orange-300 border-orange-500/40',
        totalClass: 'text-orange-300 font-extrabold',
        subClass: 'text-orange-200/70',
        emptyBarClass: 'orbit-podium-bronze opacity-30',
        emptyNumClass: 'text-orange-400/40',
        barHeight: 'h-14 sm:h-16',
        avatarSize: 'w-11 h-11'
      }
    };

    const renderPodiumSlot = (entry, rank) => {
      const theme = PODIUM_THEMES[rank];
      if (!entry) {
        return `
          <div class="flex flex-col items-center flex-1 max-w-[160px] relative z-10">
            <div class="h-6 flex items-end justify-center mb-0.5">
              <span class="text-xs opacity-50 select-none">${theme.medal}</span>
            </div>
            <div class="${theme.avatarSize} rounded-full bg-neutral-800/40 border border-white/5 flex items-center justify-center text-xs text-neutral-500 font-medium">?</div>
            <div class="h-3 w-14 rounded bg-neutral-800/30 mt-2"></div>
            <div class="h-3.5 w-8 rounded bg-neutral-800/20 mt-1"></div>
            <div class="mb-1 mt-0.5 h-3"></div>
            <div class="w-[88%] ${theme.barHeight} ${theme.emptyBarClass} rounded-t-xl mt-1 flex items-end justify-center pb-3">
              <span class="text-3xl font-black ${theme.emptyNumClass}">${rank}</span>
            </div>
          </div>
        `;
      }
      return `
        <div class="flex flex-col items-center flex-1 max-w-[160px] relative z-10 group">
          <div class="h-6 flex items-end justify-center mb-0.5">
            <span class="text-sm drop-shadow-md select-none">${theme.medal}</span>
          </div>
          <img src="${escapeHtml(entry.avatar)}" alt="${escapeHtml(entry.name)}" class="${theme.avatarSize} rounded-full object-cover ${theme.ringClass} transition-transform duration-200 group-hover:scale-105">
          <span class="text-xs font-bold text-white truncate max-w-[115px] mt-2 text-center" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</span>
          <span class="text-[9.5px] font-semibold px-2 py-0.5 rounded-full border ${theme.badgeBg} uppercase tracking-wider mt-0.5">${theme.label}</span>
          ${state.show_inviter_count ? `
            <span class="text-[11.5px] ${theme.totalClass} tabular-nums mt-0.5">${entry.total} Einl.</span>
            <span class="text-[9.5px] ${theme.subClass} tabular-nums mb-1 mt-0.5 h-3">+${entry.regular} / -${entry.left}</span>
          ` : `<div class="mb-1 mt-0.5 h-3"></div>`}
          <div class="w-[88%] ${theme.barHeight} ${theme.barClass} rounded-t-xl mt-1 flex items-end justify-center pb-3 transition-transform duration-200 group-hover:scale-[1.02]">
            <span class="text-3xl font-black ${theme.numClass}">${rank}</span>
          </div>
        </div>
      `;
    };

    if (lb.length === 0) {
      return `
        <div class="relative flex items-end justify-center px-4 pt-6 pb-0 gap-2 sm:gap-3">
          <div class="absolute bottom-0 left-4 right-4 h-px bg-neutral-800"></div>
          ${renderPodiumSlot(null, 2)}
          ${renderPodiumSlot(null, 1)}
          ${renderPodiumSlot(null, 3)}
        </div>
        <div class="border-t border-neutral-800 flex-1 min-h-0 overflow-y-auto max-h-[55vh] lg:max-h-none scrollbar-none">
          <div class="flex items-center gap-3 px-5 py-2.5" style="opacity: 0.15;">
            <span class="text-xs font-semibold text-neutral-500 w-7 text-right tabular-nums flex-shrink-0">#4</span>
            <div class="w-7 h-7 rounded-full bg-neutral-700 flex-shrink-0"></div>
            <div class="h-3 rounded-sm bg-neutral-700 w-28"></div>
            <div class="h-3 w-8 rounded-sm bg-neutral-700 flex-shrink-0 ml-auto"></div>
          </div>
          <div class="flex items-center gap-3 px-5 py-2.5" style="opacity: 0.12;">
            <span class="text-xs font-semibold text-neutral-500 w-7 text-right tabular-nums flex-shrink-0">#5</span>
            <div class="w-7 h-7 rounded-full bg-neutral-700 flex-shrink-0"></div>
            <div class="h-3 rounded-sm bg-neutral-700 w-20"></div>
            <div class="h-3 w-8 rounded-sm bg-neutral-700 flex-shrink-0 ml-auto"></div>
          </div>
          <div class="flex items-center gap-3 px-5 py-2.5" style="opacity: 0.09;">
            <span class="text-xs font-semibold text-neutral-500 w-7 text-right tabular-nums flex-shrink-0">#6</span>
            <div class="w-7 h-7 rounded-full bg-neutral-700 flex-shrink-0"></div>
            <div class="h-3 rounded-sm bg-neutral-700 w-24"></div>
            <div class="h-3 w-8 rounded-sm bg-neutral-700 flex-shrink-0 ml-auto"></div>
          </div>
          <div class="flex items-center gap-3 px-5 py-2.5" style="opacity: 0.06;">
            <span class="text-xs font-semibold text-neutral-500 w-7 text-right tabular-nums flex-shrink-0">#7</span>
            <div class="w-7 h-7 rounded-full bg-neutral-700 flex-shrink-0"></div>
            <div class="h-3 rounded-sm bg-neutral-700 w-16"></div>
            <div class="h-3 w-8 rounded-sm bg-neutral-700 flex-shrink-0 ml-auto"></div>
          </div>
          <div class="flex items-center gap-3 px-5 py-2.5" style="opacity: 0.03;">
            <span class="text-xs font-semibold text-neutral-500 w-7 text-right tabular-nums flex-shrink-0">#8</span>
            <div class="w-7 h-7 rounded-full bg-neutral-700 flex-shrink-0"></div>
            <div class="h-3 rounded-sm bg-neutral-700 w-22"></div>
            <div class="h-3 w-8 rounded-sm bg-neutral-700 flex-shrink-0 ml-auto"></div>
          </div>
          <div class="flex flex-col items-center justify-center py-4 px-6 text-center">
            <p class="text-sm font-medium text-neutral-400 text-pretty">Das Podium ist leer</p>
          </div>
        </div>
      `;
    }

    const first = lb[0] || null;
    const second = lb[1] || null;
    const third = lb[2] || null;

    const restRows = lb.slice(3).map((entry, i) => {
      const rank = i + 4;
      return `
        <div class="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.02] transition-colors">
          <span class="text-xs font-semibold text-neutral-500 w-7 text-right tabular-nums flex-shrink-0">#${rank}</span>
          <img src="${escapeHtml(entry.avatar)}" alt="${escapeHtml(entry.name)}" class="w-7 h-7 rounded-full object-cover flex-shrink-0">
          <span class="text-xs font-medium text-neutral-200 truncate">${escapeHtml(entry.name)}</span>
          ${state.show_inviter_count ? `
            <div class="ml-auto flex items-center gap-2.5 flex-shrink-0 tabular-nums">
              <span class="text-[11px] text-neutral-500">+${entry.regular} / -${entry.left}</span>
              <span class="text-xs font-semibold text-white">${entry.total}</span>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="relative flex items-end justify-center px-4 pt-6 pb-0 gap-2 sm:gap-3">
        <div class="absolute bottom-0 left-4 right-4 h-px bg-neutral-800"></div>
        ${renderPodiumSlot(second, 2)}
        ${renderPodiumSlot(first, 1)}
        ${renderPodiumSlot(third, 3)}
      </div>
      <div class="border-t border-neutral-800 flex-1 min-h-0 overflow-y-auto max-h-[55vh] lg:max-h-none scrollbar-none divide-y divide-neutral-800/40">
        ${restRows || `
          <div class="flex flex-col items-center justify-center py-8 px-6 text-center">
            <p class="text-xs text-neutral-500">Keine weiteren Platzierungen ab #4</p>
          </div>
        `}
      </div>
    `;
  }

  function renderRewardsSectionContent() {
    const sorted = [...state.rewards].sort((a, b) => a.invites - b.invites);
    if (sorted.length === 0) {
      return `
        <div class="flex flex-col items-center gap-1 py-3 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gift w-4 h-4 text-neutral-800">
            <rect x="3" y="8" width="18" height="4" rx="1"></rect>
            <path d="M12 8v13"></path>
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
            <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path>
          </svg>
          <p class="text-xs text-neutral-600 leading-snug max-w-[200px] text-pretty">Weise Rollen automatisch zu, wenn Mitglieder einen Einladungs-Meilenstein erreichen.</p>
        </div>
      `;
    }

    return sorted.map((rw, idx) => {
      const roleObj = allRoles.find(r => String(r.id) === String(rw.role_id));
      const rName = roleObj ? roleObj.name : `Rolle (${rw.role_id})`;
      const rColor = roleObj?.color || '#b9bbbe';
      return `
        <div class="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-neutral-800/60 border border-neutral-800 group">
          <div class="flex items-center gap-2 min-w-0">
            <span class="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700/70 text-[11px] font-semibold text-white tabular-nums flex-shrink-0">${rw.invites} Einl.</span>
            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${escapeHtml(rColor)};"></span>
            <span class="text-xs font-medium text-neutral-200 truncate">${escapeHtml(rName)}</span>
          </div>
          <button type="button" data-remove-reward="${idx}" class="p-1 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-700/50 transition-colors flex-shrink-0" title="Belohnung entfernen">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </div>
      `;
    }).join('');
  }

  function renderSourcesSectionContent() {
    if (!state.sources || state.sources.length === 0) {
      return `
        <div class="relative">
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pointer-events-none select-none" aria-hidden="true">
            <div class="rounded-xl border border-neutral-800/50 overflow-hidden opacity-[0.3]">
              <div class="h-1" style="background-color: rgb(239, 68, 68);"></div>
              <div class="pl-4 pr-3 py-5 space-y-5">
                <div class="flex items-start justify-between">
                  <div class="space-y-2">
                    <div class="w-20 h-4 rounded bg-neutral-700/60"></div>
                    <div class="w-32 h-3 rounded bg-neutral-800/40"></div>
                  </div>
                  <div class="w-5 h-5 rounded bg-neutral-800/50"></div>
                </div>
                <div class="flex items-baseline gap-4 pt-1">
                  <div class="flex items-baseline gap-1.5">
                    <div class="w-12 h-7 rounded bg-neutral-700/50"></div>
                    <div class="w-8 h-3.5 rounded bg-neutral-800/50"></div>
                  </div>
                  <div class="w-10 h-4.5 rounded bg-neutral-800/40"></div>
                  <div class="flex items-baseline gap-1 ml-auto">
                    <div class="w-9 h-4 rounded bg-neutral-800/50"></div>
                    <div class="w-12 h-3 rounded bg-neutral-800/30"></div>
                  </div>
                </div>
                <div class="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div class="h-full rounded-full opacity-40" style="width: 75%; background-color: rgb(239, 68, 68);"></div>
                </div>
                <div class="flex items-center justify-between pt-1">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-3 rounded bg-neutral-800/40"></div>
                    <div class="w-12 h-3 rounded bg-neutral-800/35"></div>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <div class="w-3.5 h-3.5 rounded bg-neutral-800/30"></div>
                    <div class="w-28 h-3 rounded bg-neutral-800/25"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="rounded-xl border border-neutral-800/50 overflow-hidden opacity-[0.3]">
              <div class="h-1" style="background-color: rgb(59, 130, 246);"></div>
              <div class="pl-4 pr-3 py-5 space-y-5">
                <div class="flex items-start justify-between">
                  <div class="space-y-2">
                    <div class="w-16 h-4 rounded bg-neutral-700/60"></div>
                    <div class="w-32 h-3 rounded bg-neutral-800/40"></div>
                  </div>
                  <div class="w-5 h-5 rounded bg-neutral-800/50"></div>
                </div>
                <div class="flex items-baseline gap-4 pt-1">
                  <div class="flex items-baseline gap-1.5">
                    <div class="w-10 h-7 rounded bg-neutral-700/50"></div>
                    <div class="w-8 h-3.5 rounded bg-neutral-800/50"></div>
                  </div>
                  <div class="w-10 h-4.5 rounded bg-neutral-800/40"></div>
                  <div class="flex items-baseline gap-1 ml-auto">
                    <div class="w-9 h-4 rounded bg-neutral-800/50"></div>
                    <div class="w-12 h-3 rounded bg-neutral-800/30"></div>
                  </div>
                </div>
                <div class="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div class="h-full rounded-full opacity-40" style="width: 55%; background-color: rgb(59, 130, 246);"></div>
                </div>
                <div class="flex items-center justify-between pt-1">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-3 rounded bg-neutral-800/40"></div>
                    <div class="w-12 h-3 rounded bg-neutral-800/35"></div>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <div class="w-3.5 h-3.5 rounded bg-neutral-800/30"></div>
                    <div class="w-28 h-3 rounded bg-neutral-800/25"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="rounded-xl border border-neutral-800/50 overflow-hidden opacity-[0.3]">
              <div class="h-1" style="background-color: rgb(249, 115, 22);"></div>
              <div class="pl-4 pr-3 py-5 space-y-5">
                <div class="flex items-start justify-between">
                  <div class="space-y-2">
                    <div class="w-14 h-4 rounded bg-neutral-700/60"></div>
                    <div class="w-32 h-3 rounded bg-neutral-800/40"></div>
                  </div>
                  <div class="w-5 h-5 rounded bg-neutral-800/50"></div>
                </div>
                <div class="flex items-baseline gap-4 pt-1">
                  <div class="flex items-baseline gap-1.5">
                    <div class="w-11 h-7 rounded bg-neutral-700/50"></div>
                    <div class="w-8 h-3.5 rounded bg-neutral-800/50"></div>
                  </div>
                  <div class="w-10 h-4.5 rounded bg-neutral-800/40"></div>
                  <div class="flex items-baseline gap-1 ml-auto">
                    <div class="w-9 h-4 rounded bg-neutral-800/50"></div>
                    <div class="w-12 h-3 rounded bg-neutral-800/30"></div>
                  </div>
                </div>
                <div class="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div class="h-full rounded-full opacity-40" style="width: 35%; background-color: rgb(249, 115, 22);"></div>
                </div>
                <div class="flex items-center justify-between pt-1">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-3 rounded bg-neutral-800/40"></div>
                    <div class="w-12 h-3 rounded bg-neutral-800/35"></div>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <div class="w-3.5 h-3.5 rounded bg-neutral-800/30"></div>
                    <div class="w-28 h-3 rounded bg-neutral-800/25"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/60 backdrop-blur-[2px] rounded-xl">
            <div class="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link2 w-5 h-5 text-neutral-500">
                <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
                <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
                <line x1="8" x2="16" y1="12" y2="12"></line>
              </svg>
            </div>
            <h3 class="text-sm font-semibold text-white mb-1">Tracke deine Einladungsquellen</h3>
            <p class="text-[11px] text-neutral-500 text-center max-w-xs mb-4 leading-relaxed">Erstelle einzigartige Einladungslinks für YouTube, Twitter, Reddit und mehr.</p>
            <button type="button" id="inv-create-source-empty-btn" class="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-semibold rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-3.5 h-3.5">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>Quelle erstellen</button>
          </div>
        </div>
      `;
    }

    const totalUsesAll = Math.max(1, state.sources.reduce((acc, s) => acc + (Number(s.uses) || 0), 0));
    return `
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        ${state.sources.map(src => {
          const uses = Number(src.uses) || 0;
          const active = Number(src.active) || 0;
          const left = Number(src.left) || 0;
          const retention = uses > 0 ? Math.round((active / uses) * 100) : 100;
          const sharePct = uses > 0 ? Math.max(8, Math.round((uses / totalUsesAll) * 100)) : 0;
          return `
            <div class="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700/80 transition-colors">
              <div class="h-1" style="background-color: ${escapeHtml(src.color || 'rgb(59, 130, 246)')};"></div>
              <div class="pl-4 pr-3 py-4 space-y-4">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <h4 class="text-sm font-semibold text-white truncate">${escapeHtml(src.name)}</h4>
                    <p class="text-[11px] text-neutral-500 truncate mt-0.5">#${escapeHtml(src.channel_name || 'general')}</p>
                  </div>
                  <button type="button" data-delete-source="${escapeHtml(src.id)}" class="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors flex-shrink-0" title="Quelle löschen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
                <div class="flex items-baseline gap-4 pt-1">
                  <div class="flex items-baseline gap-1.5">
                    <span class="text-2xl font-bold text-white tabular-nums">${uses}</span>
                    <span class="text-[11px] text-neutral-500">Beitritte</span>
                  </div>
                  <div class="flex items-baseline gap-1 ml-auto">
                    <span class="text-xs font-semibold text-emerald-400 tabular-nums">${retention}%</span>
                    <span class="text-[10px] text-neutral-500">aktiv</span>
                  </div>
                </div>
                <div class="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-300" style="width: ${sharePct}%; background-color: ${escapeHtml(src.color || 'rgb(59, 130, 246)')};"></div>
                </div>
                <div class="flex items-center justify-between pt-1 text-[11px]">
                  <div class="flex items-center gap-3 tabular-nums">
                    <span class="text-emerald-400/90">+${active} aktiv</span>
                    <span class="text-rose-400/80">-${left} verl.</span>
                  </div>
                  <button type="button" data-copy-invite="https://discord.gg/${escapeHtml(src.code)}" class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors font-mono text-[11px] cursor-pointer" title="Einladungslink kopieren">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy text-neutral-400"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                    <span>discord.gg/${escapeHtml(src.code)}</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function render() {
    const selectedRewardRole = allRoles.find(r => String(r.id) === String(draftRewardRoleId));
    const selectedAutoPostChannel = allChannels.find(c => String(c.id) === String(state.auto_post.channel_id));
    const canAddReward = Number(draftRewardInvites) >= 1 && Boolean(draftRewardRoleId);
    const rewardPct = Math.min(100, (state.rewards.length / 999) * 100);

    container.innerHTML = `
      <div class="max-w-[1200px] mx-auto">
        <div>
          <div data-tour="feature-header" class="scroll-mt-24">
            <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-plus w-5 h-5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <line x1="19" x2="19" y1="8" y2="14"></line>
                    <line x1="22" x2="16" y1="11" y2="11"></line>
                  </svg>
                </span>
                <h1 class="text-base font-medium text-white truncate">Einladungs-Tracker</h1>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <div class="grid grid-cols-1 lg:grid-cols-[340px,1fr] gap-4 lg:items-stretch">
              <!-- Right Column: Top-Einlader -->
              <div class="lg:order-2 lg:relative flex flex-col min-h-[420px]">
                <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col lg:absolute lg:inset-0">
                  <div class="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
                    <div class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-medal w-4 h-4 text-neutral-500">
                        <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"></path>
                        <path d="M11 12 5.12 2.2"></path>
                        <path d="m13 12 5.88-9.8"></path>
                        <path d="M8 7h8"></path>
                        <circle cx="12" cy="17" r="5"></circle>
                        <path d="M12 18v-2h-.5"></path>
                      </svg>
                      <span class="text-sm font-medium text-white">Top-Einlader</span>
                    </div>
                  </div>
                  <div id="inv-leaderboard-body" class="flex-1 flex flex-col min-h-0">
                    ${renderLeaderboardCardContent()}
                  </div>
                </div>
              </div>

              <!-- Left Column: Settings, Rewards, Auto-Post -->
              <div class="flex flex-col lg:order-1">
                <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col flex-1">
                  <div class="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-neutral-800">
                    <div class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings w-4 h-4 text-blue-400">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <h3 class="text-sm font-medium text-white text-balance">Einladungs-Tracking</h3>
                    </div>
                    <div class="flex items-center gap-3">
                      ${renderSwitchHtml('inv-switch-enabled', state.enabled)}
                    </div>
                  </div>

                  <div class="divide-y divide-neutral-800/50">
                    <div class="flex items-center justify-between gap-3 px-4 py-2">
                      <span class="text-sm text-neutral-300">Austritte tracken</span>
                      <div class="flex items-center gap-3">
                        ${renderSwitchHtml('inv-switch-leaves', state.track_leaves)}
                      </div>
                    </div>
                    <div class="flex items-center justify-between gap-3 px-4 py-2">
                      <span class="text-sm text-neutral-300">Wiedereintritte zählen</span>
                      <div class="flex items-center gap-3">
                        ${renderSwitchHtml('inv-switch-rejoins', state.count_rejoins)}
                      </div>
                    </div>
                    <div class="flex items-center justify-between gap-3 px-4 py-2">
                      <span class="text-sm text-neutral-300">Einlader-Anzahl anzeigen</span>
                      <div class="flex items-center gap-3">
                        ${renderSwitchHtml('inv-switch-count', state.show_inviter_count)}
                      </div>
                    </div>
                    <div class="flex items-center justify-between gap-3 px-4 py-2">
                      <span class="text-sm text-neutral-300">Vanity-URL-Beitritte zählen (discord.gg/yourvanity)</span>
                      <div class="flex items-center gap-3">
                        ${renderSwitchHtml('inv-switch-vanity', state.count_vanity)}
                      </div>
                    </div>
                  </div>

                  <!-- Belohnungen -->
                  <div class="border-t border-neutral-800 px-4 pt-3 pb-2">
                    <div class="flex items-center gap-2 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gift w-3.5 h-3.5 text-neutral-500">
                        <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                        <path d="M12 8v13"></path>
                        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
                        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path>
                      </svg>
                      <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Belohnungen</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span id="inv-rewards-counter" class="text-xs tabular-nums text-neutral-500">${state.rewards.length}/999 Belohnungen</span>
                      <div class="w-16 h-1 rounded-full bg-neutral-800 overflow-hidden">
                        <div id="inv-rewards-bar" class="h-full rounded-full transition-all bg-white/60" style="width: ${rewardPct}%;"></div>
                      </div>
                    </div>
                  </div>

                  <div id="inv-rewards-list" class="px-3 py-2 space-y-1 min-h-[200px] max-h-[200px] overflow-y-auto scrollbar-thin">
                    ${renderRewardsSectionContent()}
                  </div>

                  <div class="px-3 pb-3 pt-2 border-t border-neutral-800/40 flex gap-2">
                    <input id="inv-reward-invites-input" min="1" aria-label="Anzahl der erforderlichen Einladungen" placeholder="Einladungen" class="w-16 flex-shrink-0 px-2 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-xs text-center placeholder-neutral-600 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600/30 transition-colors duration-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" type="number" value="${escapeHtml(draftRewardInvites)}">
                    <div class="flex-1 min-w-0">
                      <div class="w-full relative">
                        <button type="button" id="inv-reward-role-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                          ${selectedRewardRole ? `
                            <span class="flex items-center gap-2 min-w-0 truncate text-sm text-white">
                              <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${escapeHtml(selectedRewardRole.color || '#b9bbbe')};"></span>
                              <span class="truncate">${escapeHtml(selectedRewardRole.name)}</span>
                            </span>
                          ` : `
                            <span class="min-w-0 truncate text-sm text-neutral-500">Rolle...</span>
                          `}
                          <div class="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200 ${rewardRoleDropdownOpen ? 'rotate-180' : ''}">
                              <path d="m6 9 6 6 6-6"></path>
                            </svg>
                          </div>
                        </button>
                        <div id="inv-reward-role-menu" data-lenis-prevent="true" style="z-index: 99999;" class="orbit-dropdown-menu ${rewardRoleDropdownOpen ? '' : 'hidden'} absolute left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] max-h-60 flex flex-col overflow-hidden">
                          <div class="orbit-searchbar-header sticky top-0 z-20 p-2 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800/80 shrink-0">
                            <div class="relative w-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                              <input type="text" id="inv-reward-role-search" placeholder="Suchen..." class="orbit-searchbar-input w-full pl-9 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off">
                            </div>
                          </div>
                          <div class="overflow-y-auto overscroll-contain p-1 max-h-48 scrollbar-thin" data-lenis-prevent="true">
                            ${allRoles.length > 0 ? allRoles.map(r => `
                              <button type="button" data-pick-reward-role="${escapeHtml(r.id)}" data-search-label="${escapeHtml((r.name || '').toLowerCase())}" class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left hover:bg-neutral-800 transition-colors cursor-pointer ${String(r.id) === String(draftRewardRoleId) ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300'}">
                                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${escapeHtml(r.color || '#b9bbbe')};"></span>
                                <span class="truncate">${escapeHtml(r.name)}</span>
                              </button>
                            `).join('') : `
                              <div class="px-3 py-2 text-xs text-neutral-500">Keine Rollen verfügbar</div>
                            `}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button type="button" id="inv-reward-add-btn" ${canAddReward ? '' : 'disabled=""'} class="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-white text-black text-xs font-medium hover:bg-neutral-200 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-50 disabled:cursor-not-allowed transition-[transform,background-color,color] duration-150 ease-out flex-shrink-0 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-3 h-3">
                        <path d="M5 12h14"></path>
                        <path d="M12 5v14"></path>
                      </svg>Hinzufügen</button>
                  </div>

                  <!-- Auto-Post -->
                  <div class="border-t border-neutral-800">
                    <div class="relative flex flex-col !rounded-none !border-0 [&>div:last-child]:!rounded-none">
                      <div class="flex flex-col flex-1">
                        <div class="flex items-center justify-between px-4 pt-3 pb-3">
                          <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-3.5 h-3.5 text-neutral-500">
                              <path d="m22 2-7 20-4-9-9-4Z"></path>
                              <path d="M22 2 11 13"></path>
                            </svg>
                            <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Auto-Post</span>
                            <span class="inline-flex items-center justify-center font-semibold uppercase tracking-[0.04em] leading-none tabular-nums select-none border align-middle whitespace-nowrap translate-y-px shadow-[0_1px_2px_-0.5px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] text-emerald-400 border-emerald-500/20 bg-gradient-to-b from-emerald-400/25 to-emerald-600/10 h-[19px] pl-[5px] pr-[6.5px] gap-[3px] rounded-[6px] text-[9.5px]">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles shrink-0 -ml-px opacity-90" aria-hidden="true">
                                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                                <path d="M5 3v4"></path>
                                <path d="M19 17v4"></path>
                                <path d="M3 5h4"></path>
                                <path d="M17 19h4"></path>
                              </svg>Anlasser</span>
                          </div>
                          <div class="flex items-center gap-3">
                            ${renderSwitchHtml('inv-switch-autopost', state.auto_post.enabled)}
                          </div>
                        </div>

                        <div class="px-4 pb-3 space-y-2.5">
                          <div class="w-full relative">
                            <button type="button" id="inv-autopost-channel-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                              ${selectedAutoPostChannel ? `
                                <span class="min-w-0 truncate text-sm text-white"># ${escapeHtml(selectedAutoPostChannel.name)}</span>
                              ` : `
                                <span class="min-w-0 truncate text-sm text-neutral-500">Beitragsnummer im Kanal</span>
                              `}
                              <div class="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200 ${autoPostChannelDropdownOpen ? 'rotate-180' : ''}">
                                  <path d="m6 9 6 6 6-6"></path>
                                </svg>
                              </div>
                            </button>
                            <div id="inv-autopost-channel-menu" data-lenis-prevent="true" style="z-index: 99999;" class="orbit-dropdown-menu ${autoPostChannelDropdownOpen ? '' : 'hidden'} absolute left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] max-h-64 flex flex-col overflow-hidden">
                              <div class="orbit-searchbar-header sticky top-0 z-20 p-2 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800/80 shrink-0">
                                <div class="relative w-full">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                                  <input type="text" id="inv-autopost-channel-search" placeholder="Suchen..." class="orbit-searchbar-input w-full pl-9 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off">
                                </div>
                              </div>
                              <div class="overflow-y-auto overscroll-contain p-1 max-h-48 scrollbar-thin" data-lenis-prevent="true">
                                ${allChannels.length > 0 ? allChannels.map(ch => `
                                  <button type="button" data-pick-autopost-channel="${escapeHtml(ch.id)}" data-search-label="${escapeHtml((ch.name || '').toLowerCase())}" class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left hover:bg-neutral-800 transition-colors cursor-pointer ${String(ch.id) === String(state.auto_post.channel_id) ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300'}">
                                    <span class="text-neutral-500">#</span>
                                    <span class="truncate">${escapeHtml(ch.name)}</span>
                                  </button>
                                `).join('') : `
                                  <div class="px-3 py-2 text-xs text-neutral-500">Keine Textkanäle verfügbar</div>
                                `}
                              </div>
                            </div>
                          </div>

                          <div class="flex items-center gap-2">
                            <input id="inv-autopost-title-input" placeholder="Embed-Titel" class="flex-1 min-w-0 px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors" type="text" value="${escapeHtml(state.auto_post.title)}">
                            <div class="relative flex flex-col">
                              <button type="button" id="inv-autopost-color-btn" class="w-8 h-8 rounded-lg border border-neutral-700 hover:border-neutral-500 transition-colors cursor-pointer flex-shrink-0" style="background-color: ${escapeHtml(state.auto_post.color)};"></button>
                              ${autoPostColorPopoverOpen ? `
                                <div class="orbit-dropdown-menu absolute right-0 top-10 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-50 p-2.5 flex items-center gap-1.5">
                                  ${PRESET_COLORS.map(c => `
                                    <button type="button" data-pick-autopost-color="${escapeHtml(c)}" class="w-5 h-5 rounded-md border ${state.auto_post.color === c ? 'border-white scale-110' : 'border-neutral-700'} transition-transform" style="background-color: ${escapeHtml(c)};"></button>
                                  `).join('')}
                                </div>
                              ` : ''}
                            </div>
                          </div>

                          <div class="pt-1">
                            <span class="text-sm text-neutral-300 block mb-1.5">Aktualisieren alle</span>
                            <div class="flex gap-1 p-0.5 rounded-xl bg-neutral-800">
                              ${['5m', '15m', '30m', '1h', '6h', '12h', '24h'].map(intv => {
                                const isActive = state.auto_post.interval === intv;
                                return `<button type="button" data-autopost-interval="${intv}" class="flex-1 py-2 rounded-lg text-xs font-medium active:scale-[0.96] transition-[transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 cursor-pointer ${isActive ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}">${intv}</button>`;
                              }).join('')}
                            </div>
                          </div>

                          <div class="flex items-center justify-between gap-3 pt-0.5">
                            <span class="text-sm text-neutral-300">Top anzeigen</span>
                            <div class="flex gap-0.5 p-0.5 rounded-xl bg-neutral-800">
                              ${[5, 10, 15, 20].map(lim => {
                                const isActive = Number(state.auto_post.top_limit) === lim;
                                return `<button type="button" data-autopost-limit="${lim}" class="px-2.5 py-1.5 rounded-lg text-xs font-medium active:scale-[0.96] transition-[transform,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer ${isActive ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}">${lim}</button>`;
                              }).join('')}
                            </div>
                          </div>

                          <div class="flex items-center justify-between gap-3">
                            <span class="text-sm text-neutral-300">Podium anzeigen</span>
                            <div class="flex items-center gap-3">
                              ${renderSwitchHtml('inv-switch-podium', state.auto_post.show_podium)}
                            </div>
                          </div>

                          <div class="flex items-center justify-between gap-3">
                            <span class="text-sm text-neutral-300">Zahlen anzeigen</span>
                            <div class="flex items-center gap-3">
                              ${renderSwitchHtml('inv-switch-numbers', state.auto_post.show_numbers)}
                            </div>
                          </div>

                          <button type="button" id="inv-post-now-btn" ${(!state.auto_post.channel_id || isPostingLeaderboard) ? 'disabled=""' : ''} class="mt-1 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-3 h-3">
                              <path d="m22 2-7 20-4-9-9-4Z"></path>
                              <path d="M22 2 11 13"></path>
                            </svg> ${isPostingLeaderboard ? 'Wird gepostet...' : 'Jetzt posten'}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Section: Quellen-Tracker -->
          <div class="mt-5 pb-4">
            <div class="bg-neutral-900 rounded-xl border border-neutral-800">
              <div class="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link2 w-5 h-5 text-neutral-500">
                    <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
                    <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
                    <line x1="8" x2="16" y1="12" y2="12"></line>
                  </svg>
                  <h3 class="text-white font-semibold">Quellen-Tracker</h3>
                </div>
                <div class="flex items-center gap-3">
                  ${state.sources.length > 0 ? `
                    <button type="button" id="inv-create-source-header-btn" class="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-xs font-semibold rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-3.5 h-3.5"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                      Quelle erstellen
                    </button>
                  ` : ''}
                </div>
              </div>
              <div id="inv-sources-body" class="p-4">
                ${renderSourcesSectionContent()}
              </div>
            </div>
          </div>
        </div>
        <div id="inv-modal-root"></div>
      </div>
    `;

    bindEvents();
  }

  function openCreateSourceModal() {
    const modalRoot = document.getElementById('inv-modal-root');
    if (!modalRoot) return;

    let draftName = 'YouTube';
    let draftColor = 'rgb(239, 68, 68)';
    let draftChannelId = allChannels[0] ? String(allChannels[0].id) : '';
    let modalChannelDropdownOpen = false;
    let isCreating = false;

    const renderModal = () => {
      const selectedChannel = allChannels.find(c => String(c.id) === String(draftChannelId));
      modalRoot.innerHTML = `
        <div id="inv-source-modal-backdrop" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div class="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
            <div class="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-blue-500/10 ring-1 ring-blue-500/15 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link2 text-blue-400">
                    <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
                    <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
                    <line x1="8" x2="16" y1="12" y2="12"></line>
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-white">Quelle erstellen</p>
                  <p class="text-[11px] text-neutral-500">Erstellt einen einzigartigen Discord-Einladungslink</p>
                </div>
              </div>
              <button type="button" id="inv-source-modal-close" class="p-1 text-neutral-500 hover:text-white rounded-md cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
              </button>
            </div>

            <div class="p-5 space-y-4">
              <div>
                <p class="text-[11px] text-neutral-500 mb-2">Plattform-Vorlage</p>
                <div class="flex flex-wrap gap-1.5">
                  ${SOURCE_PRESETS.map(p => `
                    <button type="button" data-source-preset="${escapeHtml(p.name)}" data-source-color="${escapeHtml(p.color)}" class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${draftName === p.name ? 'bg-neutral-800 border-white/25 text-white font-medium' : 'bg-neutral-800/60 border-neutral-700/60 text-neutral-300 hover:text-white'}">
                      <span class="w-2 h-2 rounded-full" style="background-color: ${escapeHtml(p.color)};"></span>
                      ${escapeHtml(p.name)}
                    </button>
                  `).join('')}
                </div>
              </div>

              <div>
                <label class="text-xs font-medium text-neutral-300 block mb-1.5">Name der Quelle</label>
                <input id="inv-source-name-input" type="text" maxlength="40" value="${escapeHtml(draftName)}" placeholder="z. B. YouTube, Twitter, Bio-Link..." class="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600">
              </div>

              <div>
                <label class="text-xs font-medium text-neutral-300 block mb-1.5">Zielkanal für Einladung</label>
                <div class="relative">
                  <button type="button" id="inv-source-channel-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border border-neutral-700 hover:border-neutral-600 rounded-xl text-sm text-left cursor-pointer">
                    <span id="inv-source-channel-label" class="truncate text-white">${selectedChannel ? `# ${escapeHtml(selectedChannel.name)}` : 'Kanal auswählen...'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down text-neutral-400 transition-transform duration-200 ${modalChannelDropdownOpen ? 'rotate-180' : ''}"><path d="m6 9 6 6 6-6"></path></svg>
                  </button>
                  <div id="inv-source-channel-menu" data-lenis-prevent="true" style="z-index: 99999;" class="orbit-dropdown-menu ${modalChannelDropdownOpen ? '' : 'hidden'} absolute left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl z-[99999] max-h-60 flex flex-col overflow-hidden">
                    <div class="orbit-searchbar-header sticky top-0 z-20 p-2 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800/80 shrink-0">
                      <div class="relative w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                        <input type="text" id="inv-source-channel-search" placeholder="Suchen..." class="orbit-searchbar-input w-full pl-9 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off">
                      </div>
                    </div>
                    <div class="overflow-y-auto overscroll-contain p-1 max-h-48 scrollbar-thin" data-lenis-prevent="true">
                      ${allChannels.length > 0 ? allChannels.map(ch => `
                        <button type="button" data-pick-source-channel="${escapeHtml(ch.id)}" data-search-label="${escapeHtml((ch.name || '').toLowerCase())}" class="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left hover:bg-neutral-800 cursor-pointer ${String(ch.id) === String(draftChannelId) ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300'}">
                          <span class="text-neutral-500">#</span>
                          <span class="truncate">${escapeHtml(ch.name)}</span>
                        </button>
                      `).join('') : `
                        <div class="px-3 py-2 text-xs text-neutral-500">Keine Textkanäle verfügbar</div>
                      `}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label class="text-xs font-medium text-neutral-300 block mb-1.5">Kartenfarbe</label>
                <div class="flex items-center gap-2">
                  ${PRESET_COLORS.map(c => `
                    <button type="button" data-pick-source-color="${escapeHtml(c)}" class="w-6 h-6 rounded-lg border transition-transform cursor-pointer ${draftColor === c ? 'border-white scale-110' : 'border-neutral-700'}" style="background-color: ${escapeHtml(c)};"></button>
                  `).join('')}
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-neutral-800">
              <button type="button" id="inv-source-modal-cancel" class="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">Abbrechen</button>
              <button type="button" id="inv-source-modal-submit" ${isCreating ? 'disabled=""' : ''} class="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-neutral-200 disabled:opacity-40 transition-colors cursor-pointer">
                ${isCreating ? 'Erstelle Link...' : 'Quelle erstellen'}
              </button>
            </div>
          </div>
        </div>
      `;

      const closeModal = () => { modalRoot.innerHTML = ''; };
      document.getElementById('inv-source-modal-close')?.addEventListener('click', closeModal);
      document.getElementById('inv-source-modal-cancel')?.addEventListener('click', closeModal);
      document.getElementById('inv-source-modal-backdrop')?.addEventListener('click', (e) => {
        if (e.target.id === 'inv-source-modal-backdrop') {
          closeModal();
          return;
        }
        const chMenu = document.getElementById('inv-source-channel-menu');
        const chBtn = document.getElementById('inv-source-channel-btn');
        if (chMenu && !chMenu.classList.contains('hidden') && !chMenu.contains(e.target) && (!chBtn || !chBtn.contains(e.target))) {
          modalChannelDropdownOpen = false;
          chMenu.classList.add('hidden');
        }
      });

      document.getElementById('inv-source-name-input')?.addEventListener('input', (e) => {
        draftName = e.target.value;
      });

      modalRoot.querySelectorAll('[data-source-preset]').forEach(btn => {
        btn.addEventListener('click', () => {
          draftName = btn.getAttribute('data-source-preset') || 'YouTube';
          draftColor = btn.getAttribute('data-source-color') || draftColor;
          renderModal();
        });
      });

      modalRoot.querySelectorAll('[data-pick-source-color]').forEach(btn => {
        btn.addEventListener('click', () => {
          draftColor = btn.getAttribute('data-pick-source-color') || draftColor;
          renderModal();
        });
      });

      document.getElementById('inv-source-channel-btn')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (allChannels.length === 0) {
          try {
            const fresh = await API.getChannels(guildId);
            const chList = Array.isArray(fresh) ? fresh : (Array.isArray(fresh?.channels) ? fresh.channels : []);
            if (chList.length > 0) {
              allChannels = chList.filter(c => !c.type || c.type === 'text' || c.type === 'news' || c.type === 0 || c.type === 5 || (typeof c.type === 'string' && c.type.includes('text')));
              renderModal();
              return;
            }
          } catch (_) {}
        }
        modalChannelDropdownOpen = !modalChannelDropdownOpen;
        const chMenu = document.getElementById('inv-source-channel-menu');
        if (chMenu) {
          chMenu.classList.toggle('hidden', !modalChannelDropdownOpen);
          if (modalChannelDropdownOpen) {
            const searchIn = document.getElementById('inv-source-channel-search');
            if (searchIn) setTimeout(() => searchIn.focus(), 10);
          }
          if (window.OrbitDropdownManager) window.OrbitDropdownManager.scheduleSync();
        }
      });

      const modalSearchInput = document.getElementById('inv-source-channel-search');
      if (modalSearchInput) {
        modalSearchInput.addEventListener('click', (e) => e.stopPropagation());
        modalSearchInput.addEventListener('input', (e) => {
          const term = (e.target.value || '').toLowerCase();
          modalRoot.querySelectorAll('[data-pick-source-channel]').forEach(item => {
            const lbl = item.getAttribute('data-search-label') || '';
            item.style.display = lbl.includes(term) ? 'flex' : 'none';
          });
        });
      }

      modalRoot.querySelectorAll('[data-pick-source-channel]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          draftChannelId = btn.getAttribute('data-pick-source-channel') || '';
          modalChannelDropdownOpen = false;
          renderModal();
        });
      });

      document.getElementById('inv-source-modal-submit')?.addEventListener('click', async () => {
        if (isCreating) return;
        const cleanName = (draftName || '').trim() || 'YouTube';
        isCreating = true;
        renderModal();
        try {
          const res = await API.createInviteSource(guildId, {
            name: cleanName,
            color: draftColor,
            channel_id: draftChannelId
          });
          if (res?.source) {
            state.sources.push(res.source);
          }
          closeModal();
          render();
          if (window.Notifications) {
            Notifications.show(`Einladungsquelle "${cleanName}" erstellt!`, 'success');
          }
        } catch (err) {
          isCreating = false;
          renderModal();
          if (window.Notifications) {
            Notifications.show(err.message || 'Fehler beim Erstellen der Quelle', 'error');
          }
        }
      });
    };

    renderModal();
  }

  function bindEvents() {
    // 1. Toggle Switches (in-place spring animation + auto-save)
    const bindSwitch = (id, getVal, setVal, afterToggle = null) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('click', () => {
        const next = !getVal();
        setVal(next);
        updateSwitchElementInPlace(btn, next);
        if (afterToggle) afterToggle(next);
        scheduleSave();
      });
    };

    bindSwitch('inv-switch-enabled', () => state.enabled, v => { state.enabled = v; });
    bindSwitch('inv-switch-leaves', () => state.track_leaves, v => { state.track_leaves = v; });
    bindSwitch('inv-switch-rejoins', () => state.count_rejoins, v => { state.count_rejoins = v; });
    bindSwitch('inv-switch-count', () => state.show_inviter_count, v => { state.show_inviter_count = v; }, () => {
      const lbBody = document.getElementById('inv-leaderboard-body');
      if (lbBody) lbBody.innerHTML = renderLeaderboardCardContent();
    });
    bindSwitch('inv-switch-vanity', () => state.count_vanity, v => { state.count_vanity = v; });
    bindSwitch('inv-switch-autopost', () => state.auto_post.enabled, v => { state.auto_post.enabled = v; });
    bindSwitch('inv-switch-podium', () => state.auto_post.show_podium, v => { state.auto_post.show_podium = v; });
    bindSwitch('inv-switch-numbers', () => state.auto_post.show_numbers, v => { state.auto_post.show_numbers = v; });

    // 2. Rewards: number input, role dropdown, add & remove
    const invInput = document.getElementById('inv-reward-invites-input');
    const addRewardBtn = document.getElementById('inv-reward-add-btn');
    if (invInput) {
      invInput.addEventListener('input', (e) => {
        draftRewardInvites = e.target.value;
        if (addRewardBtn) {
          addRewardBtn.disabled = !(Number(draftRewardInvites) >= 1 && Boolean(draftRewardRoleId));
        }
      });
    }

    document.getElementById('inv-reward-role-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      rewardRoleDropdownOpen = !rewardRoleDropdownOpen;
      autoPostChannelDropdownOpen = false;
      autoPostColorPopoverOpen = false;
      const roleMenu = document.getElementById('inv-reward-role-menu');
      const chMenu = document.getElementById('inv-autopost-channel-menu');
      if (chMenu) chMenu.classList.add('hidden');
      if (roleMenu) {
        roleMenu.classList.toggle('hidden', !rewardRoleDropdownOpen);
        if (rewardRoleDropdownOpen) {
          const s = document.getElementById('inv-reward-role-search');
          if (s) setTimeout(() => s.focus(), 10);
        }
      }
      if (window.OrbitDropdownManager) window.OrbitDropdownManager.scheduleSync();
    });

    const roleSearchInput = document.getElementById('inv-reward-role-search');
    if (roleSearchInput) {
      roleSearchInput.addEventListener('click', (e) => e.stopPropagation());
      roleSearchInput.addEventListener('input', (e) => {
        const term = (e.target.value || '').toLowerCase();
        container.querySelectorAll('[data-pick-reward-role]').forEach(item => {
          const lbl = item.getAttribute('data-search-label') || '';
          item.style.display = lbl.includes(term) ? 'flex' : 'none';
        });
      });
    }

    container.querySelectorAll('[data-pick-reward-role]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        draftRewardRoleId = btn.getAttribute('data-pick-reward-role') || '';
        rewardRoleDropdownOpen = false;
        render();
      });
    });

    if (addRewardBtn) {
      addRewardBtn.addEventListener('click', () => {
        const count = parseInt(draftRewardInvites, 10);
        if (!count || count < 1 || !draftRewardRoleId) return;
        const existingIdx = state.rewards.findIndex(
          r => Number(r.invites) === count && String(r.role_id) === String(draftRewardRoleId)
        );
        if (existingIdx === -1) {
          state.rewards.push({ invites: count, role_id: String(draftRewardRoleId) });
        }
        draftRewardInvites = '';
        draftRewardRoleId = '';
        render();
        scheduleSave(true);
      });
    }

    container.querySelectorAll('[data-remove-reward]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-remove-reward'), 10);
        const sorted = [...state.rewards].sort((a, b) => a.invites - b.invites);
        const target = sorted[idx];
        if (target) {
          state.rewards = state.rewards.filter(
            r => !(Number(r.invites) === Number(target.invites) && String(r.role_id) === String(target.role_id))
          );
          render();
          scheduleSave(true);
        }
      });
    });

    // 3. Auto-Post Controls
    document.getElementById('inv-autopost-channel-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      autoPostChannelDropdownOpen = !autoPostChannelDropdownOpen;
      rewardRoleDropdownOpen = false;
      autoPostColorPopoverOpen = false;
      const roleMenu = document.getElementById('inv-reward-role-menu');
      const chMenu = document.getElementById('inv-autopost-channel-menu');
      if (roleMenu) roleMenu.classList.add('hidden');
      if (chMenu) {
        chMenu.classList.toggle('hidden', !autoPostChannelDropdownOpen);
        if (autoPostChannelDropdownOpen) {
          const s = document.getElementById('inv-autopost-channel-search');
          if (s) setTimeout(() => s.focus(), 10);
        }
      }
      if (window.OrbitDropdownManager) window.OrbitDropdownManager.scheduleSync();
    });

    const autoPostSearchInput = document.getElementById('inv-autopost-channel-search');
    if (autoPostSearchInput) {
      autoPostSearchInput.addEventListener('click', (e) => e.stopPropagation());
      autoPostSearchInput.addEventListener('input', (e) => {
        const term = (e.target.value || '').toLowerCase();
        container.querySelectorAll('[data-pick-autopost-channel]').forEach(item => {
          const lbl = item.getAttribute('data-search-label') || '';
          item.style.display = lbl.includes(term) ? 'flex' : 'none';
        });
      });
    }

    container.querySelectorAll('[data-pick-autopost-channel]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.auto_post.channel_id = btn.getAttribute('data-pick-autopost-channel') || '';
        autoPostChannelDropdownOpen = false;
        render();
        scheduleSave(true);
      });
    });

    document.getElementById('inv-autopost-title-input')?.addEventListener('input', (e) => {
      state.auto_post.title = e.target.value;
      scheduleSave();
    });

    document.getElementById('inv-autopost-color-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      autoPostColorPopoverOpen = !autoPostColorPopoverOpen;
      rewardRoleDropdownOpen = false;
      autoPostChannelDropdownOpen = false;
      render();
    });

    container.querySelectorAll('[data-pick-autopost-color]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.auto_post.color = btn.getAttribute('data-pick-autopost-color') || 'rgb(88, 101, 242)';
        autoPostColorPopoverOpen = false;
        render();
        scheduleSave(true);
      });
    });

    container.querySelectorAll('[data-autopost-interval]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.auto_post.interval = btn.getAttribute('data-autopost-interval') || '1h';
        render();
        scheduleSave(true);
      });
    });

    container.querySelectorAll('[data-autopost-limit]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.auto_post.top_limit = parseInt(btn.getAttribute('data-autopost-limit'), 10) || 10;
        render();
        scheduleSave(true);
      });
    });

    document.getElementById('inv-post-now-btn')?.addEventListener('click', async () => {
      if (!state.auto_post.channel_id || isPostingLeaderboard) return;
      isPostingLeaderboard = true;
      render();
      try {
        await API.postInviteLeaderboard(guildId, state.auto_post);
        if (window.Notifications) {
          Notifications.show('Invite Leaderboard erfolgreich in Discord gepostet!', 'success');
        }
      } catch (err) {
        if (window.Notifications) {
          Notifications.show(err.message || 'Fehler beim Posten des Leaderboards', 'error');
        }
      } finally {
        isPostingLeaderboard = false;
        render();
      }
    });

    // 4. Quellen-Tracker Controls
    document.getElementById('inv-create-source-empty-btn')?.addEventListener('click', openCreateSourceModal);
    document.getElementById('inv-create-source-header-btn')?.addEventListener('click', openCreateSourceModal);

    container.querySelectorAll('[data-copy-invite]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const url = btn.getAttribute('data-copy-invite') || '';
        if (!url) return;
        try {
          await navigator.clipboard.writeText(url);
          if (window.Notifications) {
            Notifications.show(`Kopiert: ${url}`, 'success');
          }
        } catch (_) {}
      });
    });

    container.querySelectorAll('[data-delete-source]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const sourceId = btn.getAttribute('data-delete-source');
        if (!sourceId) return;
        try {
          await API.deleteInviteSource(guildId, sourceId);
          state.sources = state.sources.filter(s => String(s.id) !== String(sourceId));
          render();
          if (window.Notifications) {
            Notifications.show('Quelle gelöscht', 'success');
          }
        } catch (err) {
          if (window.Notifications) {
            Notifications.show(err.message || 'Fehler beim Löschen der Quelle', 'error');
          }
        }
      });
    });

    // Close open dropdowns when clicking outside
    if (!window.__orbitInvitesOutsideClickBound) {
      window.__orbitInvitesOutsideClickBound = true;
      document.addEventListener('click', () => {
        if (rewardRoleDropdownOpen || autoPostChannelDropdownOpen || autoPostColorPopoverOpen) {
          rewardRoleDropdownOpen = false;
          autoPostChannelDropdownOpen = false;
          autoPostColorPopoverOpen = false;
          if (document.getElementById('inv-switch-enabled')) {
            render();
          }
        }
      });
    }
  }

  render();
};
