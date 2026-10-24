/**
 * Orbit Dashboard - Boost Messages Tab (/dashboard/:guildId/boost)
 * Complete Nitro Boost Announcement Editor with live Discord preview,
 * variable pills, embed fields builder, color picker, mode toggles,
 * reward role dropdown, channel selector, auto-save, and test boost action.
 */

DashboardTabs.Boost = async function (container, guildId) {
  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const state = {
    guildName: 'My Server',
    boostCount: 7,
    boostTier: 2,
    botName: 'Orbit',
    botAvatar: '/img/logo.png',
    channels: [],
    roles: [],
    boost: {
      enabled: false,
      channel_id: '',
      reward_role_id: '',
      msg_mode: 'embed', // 'embed' | 'image' | 'text'
      message: 'Thank you {user} for boosting {server}! 🚀',
      image_url: '',
      embed_image: '',
      embed_thumbnail: '',
      embed_color: '#EB459E',
      embed_author: '✨ Server Boost!',
      embed_author_icon: '',
      embed_title: 'Thank you for supporting {server}!',
      embed_description: '{user} just boosted the server! We are now at **{count} boosts** (Level {tier}).',
      embed_footer: '{server} Boost Program',
      embed_footer_icon: '',
      embed_fields: []
    }
  };

  let isInitialLoading = true;
  let saveTimer = null;
  let lastFocusedInput = 'b-desc-input';

  const PRESET_COLORS = [
    '#EB459E', // Discord Nitro Pink
    '#5865F2', // Discord Blurple
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#A855F7', // Purple
    '#FFFFFF'  // White
  ];

  function renderSwitchHtml(id, checked) {
    return `
      <div class="flex items-center gap-3">
        <button type="button" id="${id}" role="switch" aria-checked="${checked ? 'true' : 'false'}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 ${checked ? 'bg-white' : 'bg-neutral-700'}">
          <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${checked ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-900'}"></span>
        </button>
      </div>
    `;
  }

  function setSwitchVisual(btnId, checked) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.setAttribute('aria-checked', checked ? 'true' : 'false');
    btn.classList.toggle('bg-white', checked);
    btn.classList.toggle('bg-neutral-700', !checked);
    const thumb = btn.querySelector('span');
    if (thumb) {
      thumb.className = `pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${checked ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-900'}`;
    }
  }

  function parseBoostTokens(text) {
    if (!text) return '';
    const map = {
      '{user}': `<span class="bg-[#5865f2]/30 text-[#c9cdfb] rounded-[3px] px-[2px]">@User</span>`,
      '{mention}': `<span class="bg-[#5865f2]/30 text-[#c9cdfb] rounded-[3px] px-[2px]">@User</span>`,
      '{username}': `<span class="bg-[#5865f2]/30 text-[#c9cdfb] rounded-[3px] px-[2px]">User</span>`,
      '{user.name}': `<span class="bg-[#5865f2]/30 text-[#c9cdfb] rounded-[3px] px-[2px]">User</span>`,
      '{user.id}': `<span class="bg-neutral-700/50 text-neutral-300 rounded-[3px] px-[2px] font-mono text-[11px]">123456789012345678</span>`,
      '{server}': `<span class="bg-green-500/30 text-green-300 rounded-[3px] px-[2px]">${esc(state.guildName)}</span>`,
      '{server.name}': `<span class="bg-green-500/30 text-green-300 rounded-[3px] px-[2px]">${esc(state.guildName)}</span>`,
      '{server.id}': `<span class="bg-neutral-700/50 text-neutral-300 rounded-[3px] px-[2px] font-mono text-[11px]">${esc(guildId)}</span>`,
      '{count}': `<span class="bg-pink-500/30 text-pink-300 rounded-[3px] px-[2px] font-bold">${esc(state.boostCount)}</span>`,
      '{boostcount}': `<span class="bg-pink-500/30 text-pink-300 rounded-[3px] px-[2px] font-bold">${esc(state.boostCount)}</span>`,
      '{tier}': `<span class="bg-pink-500/30 text-pink-300 rounded-[3px] px-[2px] font-bold">Level ${esc(state.boostTier)}</span>`,
      '{level}': `<span class="bg-pink-500/30 text-pink-300 rounded-[3px] px-[2px] font-bold">Level ${esc(state.boostTier)}</span>`
    };
    const regex = /(\{user\.name\}|\{user\.id\}|\{user\}|\{mention\}|\{username\}|\{server\.name\}|\{server\.id\}|\{server\}|\{boostcount\}|\{count\}|\{tier\}|\{level\})/g;
    return String(text).split(regex).map(part => {
      if (map[part]) return map[part];
      // Format simple bold **text** and *italics*
      let s = esc(part);
      s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
      return s;
    }).join('');
  }

  function scheduleSave() {
    if (isInitialLoading) return;
    const statusEl = document.getElementById('boost-save-status');
    if (statusEl) {
      statusEl.textContent = 'Saving...';
      statusEl.className = 'text-xs text-neutral-400 transition-colors';
    }
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        await saveNow();
        if (statusEl) {
          statusEl.textContent = 'Saved';
          statusEl.className = 'text-xs text-emerald-400 transition-colors';
          setTimeout(() => {
            if (statusEl && statusEl.textContent === 'Saved') {
              statusEl.textContent = 'Auto-saved';
              statusEl.className = 'text-xs text-neutral-500 transition-colors';
            }
          }, 1800);
        }
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = 'Save failed';
          statusEl.className = 'text-xs text-red-400 transition-colors';
        }
      }
    }, 500);
  }

  async function saveNow() {
    const b = state.boost;
    const payload = {
      boost: {
        enabled: Boolean(b.enabled),
        channel_id: b.channel_id ? String(b.channel_id) : '',
        reward_role_id: b.reward_role_id ? String(b.reward_role_id) : '',
        msg_mode: b.msg_mode || 'embed',
        message: b.message || '',
        image_url: b.image_url || '',
        embed_image: b.embed_image || b.image_url || '',
        embed_color: b.embed_color || '#EB459E',
        embed_title: b.embed_title || '',
        embed_description: b.embed_description || '',
        embed_thumbnail: b.embed_thumbnail || '',
        embed_footer: b.embed_footer || '',
        embed_author: b.embed_author || '',
        embed_author_icon: b.embed_author_icon || '',
        embed_footer_icon: b.embed_footer_icon || '',
        embed_fields: Array.isArray(b.embed_fields) ? b.embed_fields : []
      }
    };
    await API.saveConfig(guildId, payload);
  }

  function getChannelLabel(channelId) {
    if (!channelId) return '# Select channel';
    const found = state.channels.find(c => String(c.id) === String(channelId));
    return found ? `# ${found.name}` : '# Select channel';
  }

  function getChannelPureName(channelId, fallback = 'boost-announcements') {
    if (!channelId) return fallback;
    const found = state.channels.find(c => String(c.id) === String(channelId));
    return found ? found.name : fallback;
  }

  function getRoleLabel(roleId) {
    if (!roleId) return '@ Select reward role (optional)';
    const found = state.roles.find(r => String(r.id) === String(roleId));
    return found ? `@ ${found.name}` : '@ Select reward role (optional)';
  }

  function insertAtCursor(targetId, textToInsert) {
    const inputEl = document.getElementById(targetId) || document.getElementById(lastFocusedInput);
    if (!inputEl) return;
    const start = inputEl.selectionStart ?? inputEl.value.length;
    const end = inputEl.selectionEnd ?? inputEl.value.length;
    const val = inputEl.value || '';
    inputEl.value = val.slice(0, start) + textToInsert + val.slice(end);
    const nextPos = start + textToInsert.length;
    inputEl.focus();
    inputEl.setSelectionRange(nextPos, nextPos);
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function renderPage() {
    const chanSelected = Boolean(state.boost.channel_id);
    const b = state.boost;

    container.innerHTML = `
      <div class="space-y-6 pb-12">
        <!-- Feature Header -->
        <div class="scroll-mt-24">
          <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div class="flex items-center gap-3 min-w-0">
              <span class="flex items-center justify-center w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex-shrink-0 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-lg font-semibold text-white tracking-tight">Boost Messages</h1>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    Nitro
                  </span>
                </div>
                <p class="text-xs text-neutral-400 mt-0.5">Celebrate server supporters with custom Nitro boost announcements, embeds, and reward roles.</p>
              </div>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <span id="boost-save-status" class="text-xs text-neutral-500 transition-colors">Auto-saved</span>
            </div>
          </div>
        </div>

        <!-- Main Responsive Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-[1fr,320px] xl:grid-cols-[1fr,360px] gap-6 min-w-0">
          
          <!-- LEFT COLUMN: Settings & Message Editor -->
          <div class="space-y-6 min-w-0">
            
            <!-- Card 1: Configuration & Delivery Settings -->
            <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
              <div class="flex items-center justify-between gap-3 px-5 py-4 border-b border-neutral-800">
                <div class="flex items-center gap-2 min-w-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-pink-400"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  <span class="text-sm font-semibold text-white">General Boost Settings</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs text-neutral-400 font-medium">Enable Announcements</span>
                  ${renderSwitchHtml('b-enabled-switch', b.enabled)}
                </div>
              </div>

              <div class="p-5 space-y-4">
                <!-- Row: Announcement Channel & Reward Role -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Channel Selector -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-medium text-neutral-300">
                      Announcement Channel <span class="text-pink-400">*</span>
                    </label>
                    <div class="relative" id="b-channel-dropdown-wrap">
                      <button type="button" id="b-channel-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3.5 bg-neutral-800 border rounded-xl text-sm text-left transition-colors border-neutral-700 hover:border-neutral-600 cursor-pointer">
                        <span id="b-channel-label" class="min-w-0 truncate text-sm ${chanSelected ? 'text-white font-medium' : 'text-neutral-400'}">${esc(getChannelLabel(b.channel_id))}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down text-neutral-400 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
                      </button>
                      <div id="b-channel-menu" data-lenis-prevent="true" class="orbit-dropdown-menu hidden absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl z-[99999] py-1">
                        <button type="button" data-ch="" class="b-ch-opt w-full px-3 py-2 text-left text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"># No channel (Disabled)</button>
                        ${state.channels.map(c => `
                          <button type="button" data-ch="${esc(c.id)}" class="b-ch-opt w-full px-3 py-2 text-left text-xs ${String(b.channel_id) === String(c.id) ? 'bg-white/10 text-white font-semibold' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'} transition-colors truncate"># ${esc(c.name)}</button>
                        `).join('')}
                      </div>
                    </div>
                    <p class="text-[11px] text-neutral-500">The text channel where boost messages will be broadcasted.</p>
                  </div>

                  <!-- Reward Role Selector -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-medium text-neutral-300">
                      Booster Reward Role <span class="text-neutral-500 font-normal">(Optional)</span>
                    </label>
                    <div class="relative" id="b-role-dropdown-wrap">
                      <button type="button" id="b-role-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3.5 bg-neutral-800 border rounded-xl text-sm text-left transition-colors border-neutral-700 hover:border-neutral-600 cursor-pointer">
                        <span id="b-role-label" class="min-w-0 truncate text-sm ${b.reward_role_id ? 'text-white font-medium' : 'text-neutral-400'}">${esc(getRoleLabel(b.reward_role_id))}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down text-neutral-400 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
                      </button>
                      <div id="b-role-menu" data-lenis-prevent="true" class="orbit-dropdown-menu hidden absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl z-[99999] py-1">
                        <button type="button" data-role="" class="b-role-opt w-full px-3 py-2 text-left text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">@ No reward role</button>
                        ${state.roles.map(r => `
                          <button type="button" data-role="${esc(r.id)}" class="b-role-opt w-full px-3 py-2 text-left text-xs ${String(b.reward_role_id) === String(r.id) ? 'bg-white/10 text-white font-semibold' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'} transition-colors truncate">
                            <span class="inline-block w-2.5 h-2.5 rounded-full mr-1.5 align-middle" style="background-color: ${r.color && r.color !== 0 ? '#' + r.color.toString(16).padStart(6, '0') : '#99aab5'};"></span>@ ${esc(r.name)}
                          </button>
                        `).join('')}
                      </div>
                    </div>
                    <p class="text-[11px] text-neutral-500">Automatically awarded to the member when they boost.</p>
                  </div>
                </div>

                <!-- Mode Selector Segmented Tabs -->
                <div class="pt-2 border-t border-neutral-800">
                  <label class="block text-xs font-medium text-neutral-300 mb-2">Message Format</label>
                  <div class="grid grid-cols-3 gap-2 p-1 bg-neutral-800/80 rounded-xl border border-neutral-700">
                    <button type="button" data-mode="embed" class="b-mode-btn flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${b.msg_mode === 'embed' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M3 9h18"></path><path d="M9 21V9"></path></svg>
                      Discord Embed
                    </button>
                    <button type="button" data-mode="image" class="b-mode-btn flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${b.msg_mode === 'image' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                      Image Card
                    </button>
                    <button type="button" data-mode="text" class="b-mode-btn flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${b.msg_mode === 'text' ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 6.1H3"></path><path d="M21 12H3"></path><path d="M15.1 18H3"></path></svg>
                      Plain Text
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card 2: Message Content Builder -->
            <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
              <div class="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
                <div class="flex items-center gap-2 min-w-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-pink-400"><path d="m18 2 4 4-12 12H6v-4L18 2z"></path></svg>
                  <span class="text-sm font-semibold text-white">Message Content & Styling</span>
                </div>
                <span id="b-char-counter" class="text-[11px] tabular-nums text-neutral-400">0/2000 chars</span>
              </div>

              <div class="p-5 space-y-4">
                
                <!-- Variable Chips Bar -->
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-xs font-medium text-neutral-300">Click variable to insert:</span>
                    <span class="text-[10px] text-neutral-500">Inserts at cursor</span>
                  </div>
                  <div class="flex items-center gap-1.5 flex-wrap" id="b-var-chips">
                    <button type="button" data-var="{user}" class="b-chip px-2 py-1 text-xs font-medium rounded-md transition-all cursor-pointer bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30">
                      @User
                    </button>
                    <button type="button" data-var="{username}" class="b-chip px-2 py-1 text-xs font-medium rounded-md transition-all cursor-pointer bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30">
                      Username
                    </button>
                    <button type="button" data-var="{user.id}" class="b-chip px-2 py-1 text-xs font-medium rounded-md transition-all cursor-pointer bg-neutral-700/50 text-neutral-300 hover:bg-neutral-700/80 border border-neutral-600">
                      User ID
                    </button>
                    <button type="button" data-var="{server}" class="b-chip px-2 py-1 text-xs font-medium rounded-md transition-all cursor-pointer bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30">
                      @Server
                    </button>
                    <button type="button" data-var="{count}" class="b-chip px-2 py-1 text-xs font-medium rounded-md transition-all cursor-pointer bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-500/30">
                      Boost Count
                    </button>
                    <button type="button" data-var="{tier}" class="b-chip px-2 py-1 text-xs font-medium rounded-md transition-all cursor-pointer bg-fuchsia-500/20 text-fuchsia-300 hover:bg-fuchsia-500/30 border border-fuchsia-500/30">
                      Boost Level
                    </button>
                  </div>
                </div>

                <!-- EMBED MODE FIELDS -->
                <div id="b-mode-embed-section" class="${b.msg_mode === 'embed' ? 'space-y-4' : 'hidden'}">
                  
                  <!-- Author Row + Color Picker -->
                  <div class="flex items-stretch gap-3">
                    <div class="flex-1 space-y-1.5 min-w-0">
                      <label class="block text-xs font-medium text-neutral-300">Author / Header Text</label>
                      <input type="text" id="b-author-input" value="${esc(b.embed_author)}" placeholder="✨ Server Boost! (Header)" class="w-full h-10 px-3.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors">
                    </div>
                    
                    <!-- Color Picker Button -->
                    <div class="space-y-1.5 flex-shrink-0">
                      <label class="block text-xs font-medium text-neutral-300">Accent Color</label>
                      <div class="relative" id="b-color-wrap">
                        <button type="button" id="b-color-btn" class="w-10 h-10 rounded-xl shadow-sm border border-neutral-700 hover:border-neutral-500 transition-colors cursor-pointer" style="background-color: ${esc(b.embed_color || '#EB459E')};"></button>
                        <div id="b-color-popover" class="hidden absolute right-0 top-12 z-40 w-56 p-3 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl space-y-2.5">
                          <p class="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Nitro Presets</p>
                          <div class="grid grid-cols-4 gap-2">
                            ${PRESET_COLORS.map(c => `
                              <button type="button" data-color="${c}" class="b-color-preset w-9 h-7 rounded-lg border border-white/10 hover:scale-105 transition-transform cursor-pointer" style="background-color:${c};"></button>
                            `).join('')}
                          </div>
                          <div class="flex items-center gap-2 pt-2 border-t border-neutral-800">
                            <input type="color" id="b-color-native" value="${esc(b.embed_color || '#EB459E')}" class="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0">
                            <input type="text" id="b-color-hex" value="${esc(b.embed_color || '#EB459E')}" maxlength="7" class="flex-1 px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white font-mono focus:outline-none">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Title Input -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-medium text-neutral-300">Embed Title</label>
                    <input type="text" id="b-title-input" value="${esc(b.embed_title)}" placeholder="Thank you for supporting {server}!" class="w-full h-10 px-3.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors">
                  </div>

                  <!-- Description Textarea -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-medium text-neutral-300">Embed Description <span class="text-pink-400">*</span></label>
                    <textarea id="b-desc-input" rows="3" placeholder="{user} just boosted the server! We are now at **{count} boosts** (Level {tier})." class="w-full p-3.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors leading-relaxed">${esc(b.embed_description || b.message)}</textarea>
                  </div>

                  <!-- Thumbnail & Image URLs -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label class="block text-xs font-medium text-neutral-300">Thumbnail URL</label>
                      <input type="url" id="b-thumb-input" value="${esc(b.embed_thumbnail)}" placeholder="https://cdn.example.com/icon.png" class="w-full h-10 px-3.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors">
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-medium text-neutral-300">Embed Banner Image URL</label>
                      <input type="url" id="b-embed-img-input" value="${esc(b.embed_image || b.image_url)}" placeholder="https://cdn.example.com/boost-banner.png" class="w-full h-10 px-3.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors">
                    </div>
                  </div>

                  <!-- Footer Input -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-medium text-neutral-300">Embed Footer Text</label>
                    <input type="text" id="b-footer-input" value="${esc(b.embed_footer)}" placeholder="{server} Boost Program" class="w-full h-10 px-3.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors">
                  </div>

                  <!-- Embed Fields Builder -->
                  <div class="pt-3 border-t border-neutral-800 space-y-3">
                    <div class="flex items-center justify-between">
                      <div>
                        <span class="text-xs font-semibold text-white">Embed Fields</span>
                        <p class="text-[11px] text-neutral-500">Add custom grid sections (e.g. Perks, Tier Perks, Boost Streak).</p>
                      </div>
                      <button type="button" id="b-add-field-btn" class="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 hover:text-white transition-colors cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                        Add Field
                      </button>
                    </div>

                    <div id="b-fields-container" class="space-y-2.5">
                      <!-- Rendered dynamically -->
                    </div>
                  </div>
                </div>

                <!-- IMAGE CARD MODE FIELDS -->
                <div id="b-mode-image-section" class="${b.msg_mode === 'image' ? 'space-y-4' : 'hidden'}">
                  <div class="space-y-1.5">
                    <label class="block text-xs font-medium text-neutral-300">Image Card URL <span class="text-pink-400">*</span></label>
                    <input type="url" id="b-card-img-input" value="${esc(b.image_url)}" placeholder="https://cdn.example.com/nitro-card.png" class="w-full h-10 px-3.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors">
                    <p class="text-[11px] text-neutral-500">High-resolution banner or custom image card shown with the boost message.</p>
                  </div>
                  <div class="space-y-1.5">
                    <label class="block text-xs font-medium text-neutral-300">Message Caption</label>
                    <textarea id="b-card-msg-input" rows="3" placeholder="Thank you {user} for boosting {server}! 🚀" class="w-full p-3.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors leading-relaxed">${esc(b.message)}</textarea>
                  </div>
                </div>

                <!-- PLAIN TEXT MODE FIELDS -->
                <div id="b-mode-text-section" class="${b.msg_mode === 'text' ? 'space-y-4' : 'hidden'}">
                  <div class="space-y-1.5">
                    <label class="block text-xs font-medium text-neutral-300">Message Text <span class="text-pink-400">*</span></label>
                    <textarea id="b-text-msg-input" rows="4" placeholder="Thank you {user} for boosting {server}! 🚀 We are now at **{count} boosts**!" class="w-full p-3.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500 transition-colors leading-relaxed">${esc(b.message || b.embed_description)}</textarea>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: Sticky Live Discord Preview -->
          <div class="flex flex-col gap-4">
            <div class="sticky top-6 space-y-4">
              
              <!-- Discord Mock Preview Card -->
              <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
                <div class="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span class="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Live Preview</span>
                  </div>
                  <span class="text-[11px] text-neutral-500 font-mono">#discord</span>
                </div>

                <!-- Preview Window Inner (Discord Dark Theme) -->
                <div class="rounded-b-2xl overflow-hidden">
                  <!-- Channel bar -->
                  <div class="bg-[#2b2d31] px-4 py-2 flex items-center gap-2 border-b border-[#1f2023]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
                    <span id="b-preview-channel-name" class="text-xs font-semibold text-white truncate">${esc(getChannelPureName(b.channel_id))}</span>
                  </div>

                  <!-- Discord Message Area -->
                  <div class="bg-[#313338] p-4 space-y-3 font-sans min-h-[220px]">
                    <!-- Nitro System message indicator -->
                    <div class="flex items-center gap-2 text-xs">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="text-[#f47fff] flex-shrink-0">
                        <path d="M14.6 6.37l-3.3-3.3a1.4 1.4 0 0 0-1.98 0l-7.95 7.95a1.4 1.4 0 0 0 0 1.98l3.3 3.3a1.4 1.4 0 0 0 1.98 0l7.95-7.95a1.4 1.4 0 0 0 0-1.98zM9.9 4.38l1.72 1.72-6.52 6.52-1.72-1.72 6.52-6.52z"/>
                      </svg>
                      <p class="text-neutral-400 text-xs">
                        <span class="font-medium text-white hover:underline cursor-pointer">BoosterUser</span> just boosted the server!
                      </p>
                    </div>

                    <!-- Bot Announcement Message -->
                    <div id="b-preview-bot-wrap" class="flex items-start gap-3 ${b.enabled ? 'opacity-100' : 'opacity-40'} transition-opacity">
                      <img src="${esc(state.botAvatar)}" alt="${esc(state.botName)}" class="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 mb-1">
                          <span class="text-xs font-semibold text-indigo-400">${esc(state.botName)}</span>
                          <span class="inline-flex items-center px-1 py-px text-[9px] font-bold bg-[#5865F2] text-white rounded">APP</span>
                          <span class="text-[11px] text-neutral-500">Today at 12:00 PM</span>
                        </div>

                        <!-- Dynamic Preview Content -->
                        <div id="b-preview-content" class="text-xs text-[#dbdee1]">
                          <!-- Rendered live -->
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Card Footer Actions: Send Test Boost -->
                <div class="p-4 border-t border-neutral-800 bg-neutral-900/50 flex flex-col gap-2">
                  <button type="button" id="b-send-test-btn" ${chanSelected ? '' : 'disabled=""'} class="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-pink-500 hover:bg-pink-600 text-white active:scale-[0.98]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
                    Send Test Boost Announcement
                  </button>
                  <p class="text-[11px] text-neutral-500 text-center">Sends an authentic Nitro test message into your chosen Discord channel.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    `;

    renderFieldsList();
    updateLivePreview();
    bindEvents();
  }

  function renderFieldsList() {
    const containerEl = document.getElementById('b-fields-container');
    if (!containerEl) return;
    const fields = state.boost.embed_fields || [];
    if (fields.length === 0) {
      containerEl.innerHTML = `
        <div class="p-3 rounded-xl bg-neutral-800/40 border border-dashed border-neutral-700/60 text-center">
          <p class="text-xs text-neutral-400">No custom fields added yet. Click "+ Add Field" above to add perks or stats.</p>
        </div>
      `;
      return;
    }

    containerEl.innerHTML = fields.map((f, idx) => `
      <div class="p-3 rounded-xl bg-neutral-800/70 border border-neutral-700 space-y-2.5 relative group" data-idx="${idx}">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Field #${idx + 1}</span>
          <div class="flex items-center gap-3">
            <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs text-neutral-300">
              <input type="checkbox" class="b-field-inline-chk rounded bg-neutral-700 border-neutral-600 text-pink-500 focus:ring-0 cursor-pointer" data-idx="${idx}" ${f.inline ? 'checked' : ''}>
              Inline
            </label>
            <button type="button" class="b-field-remove-btn p-1 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer" data-idx="${idx}" title="Remove Field">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input type="text" class="b-field-name-input h-9 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-xs focus:outline-none focus:border-neutral-500" placeholder="Field Name (e.g. Perks)" value="${esc(f.name)}" data-idx="${idx}">
          <input type="text" class="b-field-value-input h-9 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-xs focus:outline-none focus:border-neutral-500" placeholder="Field Value (e.g. Access to #vip)" value="${esc(f.value)}" data-idx="${idx}">
        </div>
      </div>
    `).join('');

    // Bind field event handlers
    containerEl.querySelectorAll('.b-field-name-input').forEach(input => {
      input.addEventListener('focus', () => { lastFocusedInput = input; });
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        state.boost.embed_fields[idx].name = e.target.value;
        updateLivePreview();
        scheduleSave();
      });
    });

    containerEl.querySelectorAll('.b-field-value-input').forEach(input => {
      input.addEventListener('focus', () => { lastFocusedInput = input; });
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        state.boost.embed_fields[idx].value = e.target.value;
        updateLivePreview();
        scheduleSave();
      });
    });

    containerEl.querySelectorAll('.b-field-inline-chk').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        state.boost.embed_fields[idx].inline = e.target.checked;
        updateLivePreview();
        scheduleSave();
      });
    });

    containerEl.querySelectorAll('.b-field-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.idx, 10);
        state.boost.embed_fields.splice(idx, 1);
        renderFieldsList();
        updateLivePreview();
        scheduleSave();
      });
    });
  }

  function updateLivePreview() {
    const previewEl = document.getElementById('b-preview-content');
    if (!previewEl) return;
    const b = state.boost;

    // 1. PLAIN TEXT MODE
    if (b.msg_mode === 'text') {
      const textVal = b.message || 'Thank you {user} for boosting {server}! 🚀';
      previewEl.innerHTML = `
        <div class="leading-relaxed whitespace-pre-wrap break-words">${parseBoostTokens(textVal)}</div>
      `;
      return;
    }

    // 2. IMAGE CARD MODE
    if (b.msg_mode === 'image') {
      const caption = b.message || 'Thank you {user} for boosting {server}! 🚀';
      const imgUrl = b.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60';
      previewEl.innerHTML = `
        <div class="space-y-2">
          <div class="leading-relaxed whitespace-pre-wrap break-words">${parseBoostTokens(caption)}</div>
          <div class="rounded-lg overflow-hidden border border-[#232428] max-w-full">
            <img src="${esc(imgUrl)}" alt="Boost Card" class="w-full h-auto object-cover max-h-48 rounded-lg" onerror="this.onerror=null;this.src='/img/logo.png';">
          </div>
        </div>
      `;
      return;
    }

    // 3. EMBED MODE
    const color = b.embed_color || '#EB459E';
    const author = b.embed_author ? parseBoostTokens(b.embed_author) : '';
    const title = b.embed_title ? parseBoostTokens(b.embed_title) : '';
    const desc = (b.embed_description || b.message) ? parseBoostTokens(b.embed_description || b.message) : '';
    const footer = b.embed_footer ? parseBoostTokens(b.embed_footer) : '';
    const banner = b.embed_image || b.image_url;
    const thumbnail = b.embed_thumbnail;
    const fields = Array.isArray(b.embed_fields) ? b.embed_fields : [];

    previewEl.innerHTML = `
      <div class="rounded-[4px] bg-[#2b2d31] border-l-4 p-3 shadow-md space-y-2.5 max-w-full" style="border-left-color: ${esc(color)};">
        
        <!-- Header row with Author and Thumbnail -->
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1 min-w-0 flex-1">
            ${author ? `<div class="text-[11px] font-semibold text-white/90 leading-tight">${author}</div>` : ''}
            ${title ? `<div class="text-sm font-bold text-white leading-snug">${title}</div>` : ''}
          </div>
          ${thumbnail ? `
            <img src="${esc(thumbnail)}" alt="Thumb" class="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-white/5" onerror="this.style.display='none';">
          ` : ''}
        </div>

        <!-- Description -->
        ${desc ? `<div class="text-xs text-[#dbdee1] leading-relaxed whitespace-pre-wrap break-words">${desc}</div>` : ''}

        <!-- Embed Fields Grid -->
        ${fields.length > 0 ? `
          <div class="grid grid-cols-12 gap-2 pt-1">
            ${fields.map(f => `
              <div class="${f.inline ? 'col-span-6 sm:col-span-4' : 'col-span-12'} space-y-0.5">
                <div class="text-[11px] font-bold text-white">${parseBoostTokens(f.name || 'Field')}</div>
                <div class="text-xs text-[#dbdee1] leading-relaxed break-words">${parseBoostTokens(f.value || 'Value')}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Big Banner Image -->
        ${banner ? `
          <div class="rounded-lg overflow-hidden pt-1 max-w-full">
            <img src="${esc(banner)}" alt="Embed Banner" class="w-full h-auto object-cover max-h-48 rounded-lg" onerror="this.style.display='none';">
          </div>
        ` : ''}

        <!-- Footer -->
        ${footer ? `
          <div class="pt-1 border-t border-white/5 text-[10px] text-neutral-400 flex items-center gap-1.5">
            <span>${footer}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  function updateCharCount() {
    const el = document.getElementById('b-char-counter');
    if (!el) return;
    const b = state.boost;
    let total = 0;
    if (b.msg_mode === 'embed') {
      total = (b.embed_author || '').length + (b.embed_title || '').length + (b.embed_description || '').length + (b.embed_footer || '').length;
      (b.embed_fields || []).forEach(f => {
        total += (f.name || '').length + (f.value || '').length;
      });
    } else {
      total = (b.message || '').length;
    }
    el.textContent = `${total}/2000 chars`;
    el.classList.toggle('text-red-400', total > 2000);
    el.classList.toggle('text-neutral-400', total <= 2000);
  }

  function bindEvents() {
    // 1. Channel Dropdown
    const chBtn = document.getElementById('b-channel-btn');
    const chMenu = document.getElementById('b-channel-menu');
    if (chBtn && chMenu) {
      chBtn.onclick = (e) => {
        e.stopPropagation();
        chMenu.classList.toggle('hidden');
        document.getElementById('b-role-menu')?.classList.add('hidden');
        document.getElementById('b-color-popover')?.classList.add('hidden');
        if (!chMenu.classList.contains('hidden') && window.OrbitDropdownManager) {
          window.OrbitDropdownManager.scheduleSync();
        }
      };
      document.querySelectorAll('.b-ch-opt').forEach(opt => {
        opt.onclick = () => {
          state.boost.channel_id = opt.getAttribute('data-ch') || '';
          chMenu.classList.add('hidden');
          const lbl = document.getElementById('b-channel-label');
          if (lbl) {
            lbl.textContent = getChannelLabel(state.boost.channel_id);
            lbl.className = `min-w-0 truncate text-sm ${state.boost.channel_id ? 'text-white font-medium' : 'text-neutral-400'}`;
          }
          const prevCh = document.getElementById('b-preview-channel-name');
          if (prevCh) prevCh.textContent = getChannelPureName(state.boost.channel_id);
          const testBtn = document.getElementById('b-send-test-btn');
          if (testBtn) testBtn.disabled = !state.boost.channel_id;
          scheduleSave();
        };
      });
    }

    // 2. Role Dropdown
    const roleBtn = document.getElementById('b-role-btn');
    const roleMenu = document.getElementById('b-role-menu');
    if (roleBtn && roleMenu) {
      roleBtn.onclick = (e) => {
        e.stopPropagation();
        roleMenu.classList.toggle('hidden');
        chMenu?.classList.add('hidden');
        document.getElementById('b-color-popover')?.classList.add('hidden');
        if (!roleMenu.classList.contains('hidden') && window.OrbitDropdownManager) {
          window.OrbitDropdownManager.scheduleSync();
        }
      };
      document.querySelectorAll('.b-role-opt').forEach(opt => {
        opt.onclick = () => {
          state.boost.reward_role_id = opt.getAttribute('data-role') || '';
          roleMenu.classList.add('hidden');
          const lbl = document.getElementById('b-role-label');
          if (lbl) {
            lbl.textContent = getRoleLabel(state.boost.reward_role_id);
            lbl.className = `min-w-0 truncate text-sm ${state.boost.reward_role_id ? 'text-white font-medium' : 'text-neutral-400'}`;
          }
          scheduleSave();
        };
      });
    }

    // 3. Master Enabled Switch
    const switchBtn = document.getElementById('b-enabled-switch');
    if (switchBtn) {
      switchBtn.onclick = () => {
        state.boost.enabled = !state.boost.enabled;
        setSwitchVisual('b-enabled-switch', state.boost.enabled);
        const wrap = document.getElementById('b-preview-bot-wrap');
        if (wrap) {
          wrap.classList.toggle('opacity-100', state.boost.enabled);
          wrap.classList.toggle('opacity-40', !state.boost.enabled);
        }
        scheduleSave();
      };
    }

    // 4. Mode Buttons
    document.querySelectorAll('.b-mode-btn').forEach(btn => {
      btn.onclick = () => {
        const mode = btn.dataset.mode;
        state.boost.msg_mode = mode;
        document.querySelectorAll('.b-mode-btn').forEach(bEl => {
          const isActive = bEl.dataset.mode === mode;
          bEl.className = `b-mode-btn flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${isActive ? 'bg-white text-black shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'}`;
        });

        // Show/hide sections
        const embedSec = document.getElementById('b-mode-embed-section');
        const imgSec = document.getElementById('b-mode-image-section');
        const textSec = document.getElementById('b-mode-text-section');
        if (embedSec) embedSec.className = (mode === 'embed' ? 'space-y-4' : 'hidden');
        if (imgSec) imgSec.className = (mode === 'image' ? 'space-y-4' : 'hidden');
        if (textSec) textSec.className = (mode === 'text' ? 'space-y-4' : 'hidden');

        updateCharCount();
        updateLivePreview();
        scheduleSave();
      };
    });

    // 5. Track Focus on inputs
    const inputsToTrack = [
      'b-author-input', 'b-title-input', 'b-desc-input',
      'b-footer-input', 'b-thumb-input', 'b-embed-img-input',
      'b-card-img-input', 'b-card-msg-input', 'b-text-msg-input'
    ];
    inputsToTrack.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('focus', () => { lastFocusedInput = id; });
      }
    });

    // 6. Variable Chips
    document.querySelectorAll('.b-chip').forEach(chip => {
      chip.onclick = (e) => {
        e.preventDefault();
        const v = chip.dataset.var;
        insertAtCursor(lastFocusedInput, v);
      };
    });

    // 7. Inputs Wiring & Live Preview
    const authorIn = document.getElementById('b-author-input');
    if (authorIn) {
      authorIn.addEventListener('input', (e) => {
        state.boost.embed_author = e.target.value;
        updateCharCount();
        updateLivePreview();
        scheduleSave();
      });
    }

    const titleIn = document.getElementById('b-title-input');
    if (titleIn) {
      titleIn.addEventListener('input', (e) => {
        state.boost.embed_title = e.target.value;
        updateCharCount();
        updateLivePreview();
        scheduleSave();
      });
    }

    const descIn = document.getElementById('b-desc-input');
    if (descIn) {
      descIn.addEventListener('input', (e) => {
        state.boost.embed_description = e.target.value;
        state.boost.message = e.target.value;
        updateCharCount();
        updateLivePreview();
        scheduleSave();
      });
    }

    const footerIn = document.getElementById('b-footer-input');
    if (footerIn) {
      footerIn.addEventListener('input', (e) => {
        state.boost.embed_footer = e.target.value;
        updateCharCount();
        updateLivePreview();
        scheduleSave();
      });
    }

    const thumbIn = document.getElementById('b-thumb-input');
    if (thumbIn) {
      thumbIn.addEventListener('input', (e) => {
        state.boost.embed_thumbnail = e.target.value;
        updateLivePreview();
        scheduleSave();
      });
    }

    const embedImgIn = document.getElementById('b-embed-img-input');
    if (embedImgIn) {
      embedImgIn.addEventListener('input', (e) => {
        state.boost.embed_image = e.target.value;
        state.boost.image_url = e.target.value;
        updateLivePreview();
        scheduleSave();
      });
    }

    const cardImgIn = document.getElementById('b-card-img-input');
    if (cardImgIn) {
      cardImgIn.addEventListener('input', (e) => {
        state.boost.image_url = e.target.value;
        state.boost.embed_image = e.target.value;
        updateLivePreview();
        scheduleSave();
      });
    }

    const cardMsgIn = document.getElementById('b-card-msg-input');
    if (cardMsgIn) {
      cardMsgIn.addEventListener('input', (e) => {
        state.boost.message = e.target.value;
        updateCharCount();
        updateLivePreview();
        scheduleSave();
      });
    }

    const textMsgIn = document.getElementById('b-text-msg-input');
    if (textMsgIn) {
      textMsgIn.addEventListener('input', (e) => {
        state.boost.message = e.target.value;
        updateCharCount();
        updateLivePreview();
        scheduleSave();
      });
    }

    // 8. Color Picker
    const colorBtn = document.getElementById('b-color-btn');
    const colorPopover = document.getElementById('b-color-popover');
    const nativeColor = document.getElementById('b-color-native');
    const hexColor = document.getElementById('b-color-hex');

    if (colorBtn && colorPopover) {
      colorBtn.onclick = (e) => {
        e.stopPropagation();
        colorPopover.classList.toggle('hidden');
        chMenu?.classList.add('hidden');
        roleMenu?.classList.add('hidden');
      };

      const setColor = (c) => {
        state.boost.embed_color = c;
        colorBtn.style.backgroundColor = c;
        if (nativeColor) nativeColor.value = c;
        if (hexColor) hexColor.value = c;
        updateLivePreview();
        scheduleSave();
      };

      document.querySelectorAll('.b-color-preset').forEach(p => {
        p.onclick = (e) => {
          e.stopPropagation();
          setColor(p.dataset.color);
          colorPopover.classList.add('hidden');
        };
      });

      if (nativeColor) {
        nativeColor.addEventListener('input', (e) => {
          setColor(e.target.value);
        });
      }

      if (hexColor) {
        hexColor.addEventListener('input', (e) => {
          const val = e.target.value;
          if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            setColor(val);
          }
        });
      }
    }

    // 9. Add Field Button
    const addFieldBtn = document.getElementById('b-add-field-btn');
    if (addFieldBtn) {
      addFieldBtn.onclick = () => {
        if (!Array.isArray(state.boost.embed_fields)) {
          state.boost.embed_fields = [];
        }
        if (state.boost.embed_fields.length >= 25) {
          if (window.Toast) Toast.error('Discord allows a maximum of 25 fields per embed.');
          return;
        }
        state.boost.embed_fields.push({
          name: 'Perk #' + (state.boost.embed_fields.length + 1),
          value: 'Access to special channel & role perks!',
          inline: true
        });
        renderFieldsList();
        updateCharCount();
        updateLivePreview();
        scheduleSave();
      };
    }

    // 10. Send Test Boost Action
    const testBtn = document.getElementById('b-send-test-btn');
    if (testBtn) {
      testBtn.onclick = async () => {
        if (!state.boost.channel_id) {
          if (window.Toast) Toast.error('Please choose and save an announcement channel first.');
          return;
        }
        const origHtml = testBtn.innerHTML;
        testBtn.disabled = true;
        testBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Sending...
        `;
        try {
          // Ensure latest configuration is saved first
          await saveNow();
          const res = await API.request(`/api/action/${guildId}/test_message`, {
            method: 'POST',
            body: {
              type: 'boost',
              channel_id: state.boost.channel_id
            }
          });
          if (res?.success) {
            if (window.Toast) Toast.success(res.message || 'Test boost message sent successfully!');
          } else {
            if (window.Toast) Toast.error(res?.error || 'Failed to send test message.');
          }
        } catch (err) {
          if (window.Toast) Toast.error(err?.message || 'Failed to send test message.');
        } finally {
          testBtn.disabled = false;
          testBtn.innerHTML = origHtml;
        }
      };
    }

    // Close popovers on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#b-channel-dropdown-wrap')) chMenu?.classList.add('hidden');
      if (!e.target.closest('#b-role-dropdown-wrap')) roleMenu?.classList.add('hidden');
      if (!e.target.closest('#b-color-wrap')) colorPopover?.classList.add('hidden');
    });

    updateCharCount();
  }

  // Initial Fetch & State Initialization
  try {
    container.innerHTML = `
      <div class="p-12 text-center text-neutral-400 space-y-3">
        <svg class="animate-spin mx-auto h-8 w-8 text-pink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p class="text-sm font-medium">Loading Boost Messages Module...</p>
      </div>
    `;

    const cfg = await API.getConfig(guildId);
    if (cfg?.guild) {
      state.guildName = cfg.guild.name || 'My Server';
      if (cfg.guild.member_count) state.boostCount = Math.max(3, Math.floor(cfg.guild.member_count / 10));
    }
    state.channels = (cfg?.channels || []).filter(c => c.type === 0 || !c.type);
    state.roles = (cfg?.roles || []).filter(r => r.name !== '@everyone');

    if (cfg?.boost) {
      const b = cfg.boost;
      state.boost = {
        enabled: Boolean(b.enabled),
        channel_id: b.channel_id ? String(b.channel_id) : '',
        reward_role_id: b.reward_role_id ? String(b.reward_role_id) : '',
        msg_mode: b.msg_mode || 'embed',
        message: b.message || 'Thank you {user} for boosting {server}! 🚀',
        image_url: b.image_url || '',
        embed_image: b.embed_image || b.image_url || '',
        embed_thumbnail: b.embed_thumbnail || '',
        embed_color: b.embed_color || '#EB459E',
        embed_author: b.embed_author || '✨ Server Boost!',
        embed_author_icon: b.embed_author_icon || '',
        embed_title: b.embed_title || 'Thank you for supporting {server}!',
        embed_description: b.embed_description || '{user} just boosted the server! We are now at **{count} boosts** (Level {tier}).',
        embed_footer: b.embed_footer || '{server} Boost Program',
        embed_footer_icon: b.embed_footer_icon || '',
        embed_fields: Array.isArray(b.embed_fields) ? b.embed_fields : []
      };
    }
  } catch (err) {
    console.error('[Boost] Error loading config:', err);
    if (window.Toast) Toast.error('Failed to load boost configuration: ' + err.message);
  } finally {
    isInitialLoading = false;
    renderPage();
  }
};

window.renderBoostModule = function (el, guildId) {
  return DashboardTabs.Boost(el, guildId);
};
