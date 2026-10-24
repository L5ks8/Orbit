/**
 * Orbit Dashboard - XP & Leveling Tab (/dashboard/:guildId/level)
 * Full Leveling system with message/voice XP, cooldowns, custom level-up announcements,
 * level roles rewards, live preview, auto-save, and test level-up action.
 */

DashboardTabs.Level = async function (container, guildId) {
  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const state = {
    guildName: 'My Server',
    channels: [],
    roles: [],
    level: {
      enabled: true,
      levelup_channel: 'current',
      xp_multiplier: 1.0,
      msg_xp_enabled: true,
      msg_xp_amount: 20,
      msg_xp_cooldown: 60,
      voice_xp_enabled: false,
      voice_xp_amount: 6,
      voice_xp_ignore_muted: true,
      voice_xp_ignore_solo: false,
      reset_on_leave: false,
      reset_on_ban: false,
      levelup_message_content: 'GG {user}, you leveled up to **Level {level}**! 🎉',
      levelup_embed_title: '🎉 Level Up!',
      levelup_embed_description: '{user} has reached **Level {level}**!',
      level_roles_stack: false,
      level_roles: [] // [{ level: 5, role_id: "..." }]
    }
  };

  let isInitialLoading = true;
  let saveTimer = null;

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

  function getChannelLabel(chId) {
    if (chId === 'current') return 'Current Channel (where user leveled up)';
    if (chId === 'dm') return 'Direct Message (Private DM)';
    const found = state.channels.find(c => String(c.id) === String(chId));
    return found ? `# ${found.name}` : 'Current Channel (Default)';
  }

  function getRole(roleId) {
    return state.roles.find(r => String(r.id) === String(roleId));
  }

  function parseTokens(text) {
    if (!text) return '';
    const map = {
      '{user}': `<span class="bg-[#5865f2]/30 text-[#c9cdfb] rounded-[3px] px-[2px]">@User</span>`,
      '{user_mention}': `<span class="bg-[#5865f2]/30 text-[#c9cdfb] rounded-[3px] px-[2px]">@User</span>`,
      '{username}': `<span class="bg-[#5865f2]/30 text-[#c9cdfb] rounded-[3px] px-[2px]">User</span>`,
      '{level}': `<span class="bg-amber-500/30 text-amber-300 rounded-[3px] px-[2px] font-bold">5</span>`,
      '{server}': `<span class="bg-emerald-500/30 text-emerald-300 rounded-[3px] px-[2px]">${esc(state.guildName)}</span>`
    };
    const regex = /(\{user_mention\}|\{user\}|\{username\}|\{level\}|\{server\})/g;
    return String(text).split(regex).map(part => {
      if (map[part]) return map[part];
      let s = esc(part);
      s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\*(.*?)\*/g, '<em>$1</em>');
      return s;
    }).join('');
  }

  function scheduleSave() {
    if (isInitialLoading) return;
    const statusEl = document.getElementById('level-save-status');
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
    const l = state.level;
    await API.saveConfig(guildId, {
      level: {
        enabled: Boolean(l.enabled),
        levelup_channel: l.levelup_channel || 'current',
        xp_multiplier: parseFloat(l.xp_multiplier) || 1.0,
        msg_xp_enabled: Boolean(l.msg_xp_enabled),
        msg_xp_amount: parseInt(l.msg_xp_amount, 10) || 20,
        msg_xp_cooldown: parseInt(l.msg_xp_cooldown, 10) || 60,
        voice_xp_enabled: Boolean(l.voice_xp_enabled),
        voice_xp_amount: parseInt(l.voice_xp_amount, 10) || 6,
        voice_xp_ignore_muted: Boolean(l.voice_xp_ignore_muted),
        voice_xp_ignore_solo: Boolean(l.voice_xp_ignore_solo),
        reset_on_leave: Boolean(l.reset_on_leave),
        reset_on_ban: Boolean(l.reset_on_ban),
        levelup_message_content: l.levelup_message_content || '',
        levelup_embed_title: l.levelup_embed_title || '',
        levelup_embed_description: l.levelup_embed_description || '',
        level_roles_stack: Boolean(l.level_roles_stack),
        level_roles: Array.isArray(l.level_roles) ? l.level_roles : []
      }
    });
  }

  function renderPage() {
    const l = state.level;

    container.innerHTML = `
      <div class="space-y-6 pb-16 max-w-6xl mx-auto">
        <!-- Header -->
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pb-4 border-b border-neutral-800">
          <div class="flex items-center gap-3 min-w-0">
            <span class="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </span>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-lg font-semibold text-white tracking-tight">XP &amp; Leveling System</h1>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Active
                </span>
              </div>
              <p class="text-xs text-neutral-400 mt-0.5">Reward active community members with experience points, ranks, and automatic role rewards.</p>
            </div>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <span id="level-save-status" class="text-xs text-neutral-500 transition-colors">Auto-saved</span>
            <button type="button" id="btn-test-levelup" class="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-black transition-all cursor-pointer shadow-sm active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
              Test Level-Up
            </button>
          </div>
        </div>

        <!-- Master Switch Card -->
        <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex items-center justify-between gap-4">
          <div class="space-y-0.5">
            <span class="text-sm font-semibold text-white">Enable XP System</span>
            <p class="text-xs text-neutral-400">Calculate experience points and grant level progression for active members.</p>
          </div>
          ${renderSwitchHtml('level-master-switch', l.enabled)}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
          
          <!-- LEFT: XP Rates & Delivery -->
          <div class="space-y-6">
            
            <!-- Announcement Channel & Multiplier Card -->
            <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm space-y-4">
              <div class="border-b border-neutral-800 pb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>
                <h2 class="text-sm font-semibold text-white">Announcement Delivery &amp; Multiplier</h2>
              </div>

              <!-- Channel Selector Dropdown -->
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-neutral-300">Level-Up Announcement Channel</label>
                <div class="relative" id="level-ch-dropdown-wrap">
                  <button type="button" id="level-ch-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3.5 bg-neutral-800 border rounded-xl text-sm text-left transition-colors border-neutral-700 hover:border-neutral-600 cursor-pointer">
                    <span id="level-ch-label" class="min-w-0 truncate text-sm text-white font-medium">${esc(getChannelLabel(l.levelup_channel))}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400 shrink-0"><path d="m6 9 6 6 6-6"></path></svg>
                  </button>
                  <div id="level-ch-menu" data-lenis-prevent="true" class="orbit-dropdown-menu hidden absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl z-[99999] py-1">
                    <button type="button" data-ch="current" class="lvl-ch-opt w-full px-3 py-2 text-left text-xs ${l.levelup_channel === 'current' ? 'bg-white/10 text-white font-semibold' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'} transition-colors">
                      Current Channel (where message was sent)
                    </button>
                    <button type="button" data-ch="dm" class="lvl-ch-opt w-full px-3 py-2 text-left text-xs ${l.levelup_channel === 'dm' ? 'bg-white/10 text-white font-semibold' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'} transition-colors">
                      Direct Message (Private DM)
                    </button>
                    <div class="my-1 border-t border-neutral-800"></div>
                    ${state.channels.map(c => `
                      <button type="button" data-ch="${esc(c.id)}" class="lvl-ch-opt w-full px-3 py-2 text-left text-xs ${String(l.levelup_channel) === String(c.id) ? 'bg-white/10 text-white font-semibold' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'} transition-colors truncate">
                        # ${esc(c.name)}
                      </button>
                    `).join('')}
                  </div>
                </div>
                <p class="text-[11px] text-neutral-500">Where Orbit will celebrate when members level up.</p>
              </div>

              <!-- XP Multiplier Input -->
              <div class="space-y-1.5 pt-1">
                <label class="block text-xs font-medium text-neutral-300">Server XP Multiplier</label>
                <div class="flex items-center gap-3">
                  <input type="number" id="inp-xp-mult" step="0.1" min="0.1" max="10.0" value="${l.xp_multiplier || 1.0}" class="w-32 h-10 px-3.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500 font-medium">
                  <span class="text-xs text-neutral-400">Multiplier applied to all earned XP (e.g. 1.5x, 2.0x for double XP events).</span>
                </div>
              </div>
            </div>

            <!-- Message & Voice XP Configuration Card -->
            <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm space-y-4">
              <div class="border-b border-neutral-800 pb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <h2 class="text-sm font-semibold text-white">Chat &amp; Voice XP Rates</h2>
              </div>

              <!-- Message XP -->
              <div class="space-y-3 pb-3 border-b border-neutral-800">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-xs font-medium text-white">Message XP</span>
                    <p class="text-[11px] text-neutral-400">Award XP when members send messages in text channels.</p>
                  </div>
                  ${renderSwitchHtml('level-msg-xp-switch', l.msg_xp_enabled)}
                </div>

                <div class="grid grid-cols-2 gap-3 pt-1">
                  <div class="space-y-1">
                    <label class="block text-[11px] text-neutral-300 font-medium">XP per Message</label>
                    <input type="number" id="inp-msg-xp-amount" min="1" max="500" value="${l.msg_xp_amount || 20}" class="w-full h-9 px-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:outline-none focus:border-neutral-500">
                  </div>
                  <div class="space-y-1">
                    <label class="block text-[11px] text-neutral-300 font-medium">Cooldown (Seconds)</label>
                    <input type="number" id="inp-msg-xp-cooldown" min="0" max="600" value="${l.msg_xp_cooldown || 60}" class="w-full h-9 px-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:outline-none focus:border-neutral-500">
                  </div>
                </div>
              </div>

              <!-- Voice XP -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-xs font-medium text-white">Voice Channel XP</span>
                    <p class="text-[11px] text-neutral-400">Award XP while members are hanging out in voice channels.</p>
                  </div>
                  ${renderSwitchHtml('level-voice-xp-switch', l.voice_xp_enabled)}
                </div>

                <div class="grid grid-cols-2 gap-3 pt-1">
                  <div class="space-y-1">
                    <label class="block text-[11px] text-neutral-300 font-medium">XP per Minute</label>
                    <input type="number" id="inp-voice-xp-amount" min="1" max="100" value="${l.voice_xp_amount || 6}" class="w-full h-9 px-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs focus:outline-none focus:border-neutral-500">
                  </div>
                  <div class="flex items-center gap-2 pt-5">
                    <label class="inline-flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                      <input type="checkbox" id="chk-ignore-muted" class="rounded bg-neutral-700 border-neutral-600 text-amber-500 focus:ring-0 cursor-pointer" ${l.voice_xp_ignore_muted ? 'checked' : ''}>
                      <span>Ignore deafened / muted</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- RIGHT: Role Rewards & Announcement Message -->
          <div class="space-y-6">
            
            <!-- Role Rewards Card -->
            <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm space-y-4">
              <div class="border-b border-neutral-800 pb-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"></path><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8.29 18.29a2.426 2.426 0 0 0 3.42 0l3.58-3.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"></circle></svg>
                  <h2 class="text-sm font-semibold text-white">Level Role Rewards</h2>
                </div>
                <div class="flex items-center gap-2">
                  <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs text-neutral-300" title="Keep previous level roles when unlocking a higher level role">
                    <input type="checkbox" id="chk-stack-roles" class="rounded bg-neutral-700 border-neutral-600 text-amber-500 focus:ring-0 cursor-pointer" ${l.level_roles_stack ? 'checked' : ''}>
                    <span>Stack roles</span>
                  </label>
                </div>
              </div>

              <!-- Add Role Form -->
              <div class="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700 flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                <div class="w-24 shrink-0 space-y-1">
                  <label class="block text-[10px] uppercase font-semibold text-neutral-400">Level</label>
                  <input type="number" id="inp-new-role-level" min="1" max="1000" placeholder="5" class="w-full h-9 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-xs focus:outline-none focus:border-neutral-500">
                </div>
                <div class="flex-1 min-w-[140px] space-y-1">
                  <label class="block text-[10px] uppercase font-semibold text-neutral-400">Reward Role</label>
                  <select id="sel-new-reward-role" class="w-full h-9 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-xs focus:outline-none focus:border-neutral-500">
                    <option value="">Select a role...</option>
                    ${state.roles.map(r => `
                      <option value="${esc(r.id)}">@ ${esc(r.name)}</option>
                    `).join('')}
                  </select>
                </div>
                <button type="button" id="btn-add-level-role" class="self-end h-9 px-3.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95">
                  + Add Reward
                </button>
              </div>

              <!-- List of configured roles -->
              <div id="level-roles-list" class="space-y-2">
                <!-- Rendered dynamically -->
              </div>
            </div>

            <!-- Level-Up Announcement Message Card -->
            <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm space-y-4">
              <div class="border-b border-neutral-800 pb-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><path d="m18 2 4 4-12 12H6v-4L18 2z"></path></svg>
                  <h2 class="text-sm font-semibold text-white">Custom Announcement Message</h2>
                </div>
              </div>

              <!-- Variable Pills -->
              <div class="space-y-1.5">
                <span class="text-xs text-neutral-400">Click to insert:</span>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <button type="button" data-var="{user}" class="lvl-var-chip px-2 py-1 text-xs font-medium rounded-md bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 cursor-pointer">@User</button>
                  <button type="button" data-var="{username}" class="lvl-var-chip px-2 py-1 text-xs font-medium rounded-md bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 cursor-pointer">Username</button>
                  <button type="button" data-var="{level}" class="lvl-var-chip px-2 py-1 text-xs font-medium rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 cursor-pointer">Level</button>
                  <button type="button" data-var="{server}" class="lvl-var-chip px-2 py-1 text-xs font-medium rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 cursor-pointer">@Server</button>
                </div>
              </div>

              <!-- Message Textarea -->
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-neutral-300">Level-Up Text Message</label>
                <textarea id="inp-lvl-msg" rows="2" class="w-full p-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-neutral-500 leading-relaxed">${esc(l.levelup_message_content)}</textarea>
              </div>

              <!-- Live Preview Box -->
              <div class="rounded-xl border border-neutral-700/60 overflow-hidden bg-[#313338] p-3 space-y-1">
                <div class="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span class="font-semibold text-white">Preview Output:</span>
                </div>
                <div id="lvl-preview-body" class="text-xs text-[#dbdee1] leading-relaxed">
                  ${parseTokens(l.levelup_message_content)}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    `;

    renderRolesList();
    bindEvents();
  }

  function renderRolesList() {
    const listEl = document.getElementById('level-roles-list');
    if (!listEl) return;
    const roles = state.level.level_roles || [];
    if (roles.length === 0) {
      listEl.innerHTML = `
        <div class="p-3 rounded-xl bg-neutral-800/40 border border-dashed border-neutral-700/60 text-center">
          <p class="text-xs text-neutral-400">No role rewards added yet. Add a level and role above to award ranks automatically.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = roles.sort((a, b) => a.level - b.level).map((r, idx) => {
      const roleObj = getRole(r.role_id);
      const roleName = roleObj ? roleObj.name : `Role (${r.role_id})`;
      const roleColor = roleObj && roleObj.color ? '#' + roleObj.color.toString(16).padStart(6, '0') : '#99aab5';
      return `
        <div class="flex items-center justify-between p-2.5 px-3 rounded-xl bg-neutral-800/70 border border-neutral-700 text-xs">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="px-2 py-0.5 rounded-md font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 font-mono">
              Level ${r.level}
            </span>
            <span class="flex items-center gap-1.5 text-white font-medium truncate">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${roleColor};"></span>
              <span class="truncate">@ ${esc(roleName)}</span>
            </span>
          </div>
          <button type="button" class="btn-del-role-reward p-1 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer" data-idx="${idx}" title="Remove reward">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </button>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.btn-del-role-reward').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.idx, 10);
        state.level.level_roles.splice(idx, 1);
        renderRolesList();
        scheduleSave();
      };
    });
  }

  function bindEvents() {
    // 1. Channel dropdown
    const chBtn = document.getElementById('level-ch-btn');
    const chMenu = document.getElementById('level-ch-menu');
    if (chBtn && chMenu) {
      chBtn.onclick = (e) => {
        e.stopPropagation();
        chMenu.classList.toggle('hidden');
        if (!chMenu.classList.contains('hidden') && window.OrbitDropdownManager) {
          window.OrbitDropdownManager.scheduleSync();
        }
      };
      document.querySelectorAll('.lvl-ch-opt').forEach(opt => {
        opt.onclick = () => {
          state.level.levelup_channel = opt.getAttribute('data-ch') || 'current';
          chMenu.classList.add('hidden');
          const lbl = document.getElementById('level-ch-label');
          if (lbl) lbl.textContent = getChannelLabel(state.level.levelup_channel);
          scheduleSave();
        };
      });
    }

    // 2. Master toggle
    const masterBtn = document.getElementById('level-master-switch');
    if (masterBtn) {
      masterBtn.onclick = () => {
        state.level.enabled = !state.level.enabled;
        setSwitchVisual('level-master-switch', state.level.enabled);
        scheduleSave();
      };
    }

    // 3. Message XP toggle
    const msgSwitch = document.getElementById('level-msg-xp-switch');
    if (msgSwitch) {
      msgSwitch.onclick = () => {
        state.level.msg_xp_enabled = !state.level.msg_xp_enabled;
        setSwitchVisual('level-msg-xp-switch', state.level.msg_xp_enabled);
        scheduleSave();
      };
    }

    // 4. Voice XP toggle
    const voiceSwitch = document.getElementById('level-voice-xp-switch');
    if (voiceSwitch) {
      voiceSwitch.onclick = () => {
        state.level.voice_xp_enabled = !state.level.voice_xp_enabled;
        setSwitchVisual('level-voice-xp-switch', state.level.voice_xp_enabled);
        scheduleSave();
      };
    }

    // 5. XP Multiplier input
    const multInp = document.getElementById('inp-xp-mult');
    if (multInp) {
      multInp.addEventListener('input', (e) => {
        state.level.xp_multiplier = parseFloat(e.target.value) || 1.0;
        scheduleSave();
      });
    }

    // 6. Message & Voice amounts
    const msgAmtInp = document.getElementById('inp-msg-xp-amount');
    if (msgAmtInp) {
      msgAmtInp.addEventListener('input', (e) => {
        state.level.msg_xp_amount = parseInt(e.target.value, 10) || 20;
        scheduleSave();
      });
    }

    const msgCdInp = document.getElementById('inp-msg-xp-cooldown');
    if (msgCdInp) {
      msgCdInp.addEventListener('input', (e) => {
        state.level.msg_xp_cooldown = parseInt(e.target.value, 10) || 60;
        scheduleSave();
      });
    }

    const voiceAmtInp = document.getElementById('inp-voice-xp-amount');
    if (voiceAmtInp) {
      voiceAmtInp.addEventListener('input', (e) => {
        state.level.voice_xp_amount = parseInt(e.target.value, 10) || 6;
        scheduleSave();
      });
    }

    const mutedChk = document.getElementById('chk-ignore-muted');
    if (mutedChk) {
      mutedChk.addEventListener('change', (e) => {
        state.level.voice_xp_ignore_muted = e.target.checked;
        scheduleSave();
      });
    }

    const stackChk = document.getElementById('chk-stack-roles');
    if (stackChk) {
      stackChk.addEventListener('change', (e) => {
        state.level.level_roles_stack = e.target.checked;
        scheduleSave();
      });
    }

    // 7. Add Level Role Reward
    const addRoleBtn = document.getElementById('btn-add-level-role');
    if (addRoleBtn) {
      addRoleBtn.onclick = () => {
        const lvlInp = document.getElementById('inp-new-role-level');
        const roleSel = document.getElementById('sel-new-reward-role');
        const levelNum = parseInt(lvlInp?.value, 10);
        const roleId = roleSel?.value;
        if (!levelNum || levelNum < 1) {
          if (window.Toast) Toast.error('Please enter a valid level number (e.g. 5).');
          return;
        }
        if (!roleId) {
          if (window.Toast) Toast.error('Please select a role reward.');
          return;
        }
        if (!Array.isArray(state.level.level_roles)) state.level.level_roles = [];
        // Replace existing reward for same level if any
        const existingIdx = state.level.level_roles.findIndex(r => r.level === levelNum);
        if (existingIdx >= 0) {
          state.level.level_roles[existingIdx].role_id = roleId;
        } else {
          state.level.level_roles.push({ level: levelNum, role_id: roleId });
        }
        if (lvlInp) lvlInp.value = '';
        if (roleSel) roleSel.value = '';
        renderRolesList();
        scheduleSave();
      };
    }

    // 8. Custom Message & Variable Pills
    const msgInp = document.getElementById('inp-lvl-msg');
    const prevBody = document.getElementById('lvl-preview-body');
    if (msgInp) {
      msgInp.addEventListener('input', (e) => {
        state.level.levelup_message_content = e.target.value;
        if (prevBody) prevBody.innerHTML = parseTokens(e.target.value);
        scheduleSave();
      });
    }

    document.querySelectorAll('.lvl-var-chip').forEach(chip => {
      chip.onclick = (e) => {
        e.preventDefault();
        const v = chip.dataset.var;
        if (msgInp) {
          const start = msgInp.selectionStart ?? msgInp.value.length;
          const end = msgInp.selectionEnd ?? msgInp.value.length;
          const val = msgInp.value || '';
          msgInp.value = val.slice(0, start) + v + val.slice(end);
          const nextPos = start + v.length;
          msgInp.focus();
          msgInp.setSelectionRange(nextPos, nextPos);
          msgInp.dispatchEvent(new Event('input', { bubbles: true }));
        }
      };
    });

    // 9. Test Level-Up Action
    const testBtn = document.getElementById('btn-test-levelup');
    if (testBtn) {
      testBtn.onclick = async () => {
        const origText = testBtn.innerHTML;
        testBtn.disabled = true;
        testBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-black inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Testing...
        `;
        try {
          await saveNow();
          const res = await API.request(`/api/action/${guildId}/test_levelup`, {
            method: 'POST',
            body: {
              channel_id: state.level.levelup_channel === 'current' ? null : state.level.levelup_channel
            }
          });
          if (res?.success) {
            if (window.Toast) Toast.success(res.message || 'Test level-up announcement sent!');
          } else {
            if (window.Toast) Toast.error(res?.error || 'Failed to send test announcement.');
          }
        } catch (err) {
          if (window.Toast) Toast.error(err?.message || 'Failed to send test level-up.');
        } finally {
          testBtn.disabled = false;
          testBtn.innerHTML = origText;
        }
      };
    }

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#level-ch-dropdown-wrap')) chMenu?.classList.add('hidden');
    });
  }

  // Initial Fetch & Render
  try {
    container.innerHTML = `
      <div class="p-12 text-center text-neutral-400 space-y-3">
        <svg class="animate-spin mx-auto h-8 w-8 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p class="text-sm font-medium">Loading Leveling & XP Configuration...</p>
      </div>
    `;

    const cfg = await API.getConfig(guildId);
    if (cfg?.guild) {
      state.guildName = cfg.guild.name || 'My Server';
    }
    state.channels = (cfg?.channels || []).filter(c => c.type === 0 || !c.type);
    state.roles = (cfg?.roles || []).filter(r => r.name !== '@everyone');

    const l = cfg?.level || (cfg?.config && cfg.config.level) || {};
    state.level = {
      enabled: l.enabled !== false,
      levelup_channel: l.levelup_channel || 'current',
      xp_multiplier: parseFloat(l.xp_multiplier) || 1.0,
      msg_xp_enabled: l.msg_xp_enabled !== false,
      msg_xp_amount: parseInt(l.msg_xp_amount, 10) || 20,
      msg_xp_cooldown: parseInt(l.msg_xp_cooldown, 10) || 60,
      voice_xp_enabled: Boolean(l.voice_xp_enabled),
      voice_xp_amount: parseInt(l.voice_xp_amount, 10) || 6,
      voice_xp_ignore_muted: l.voice_xp_ignore_muted !== false,
      voice_xp_ignore_solo: Boolean(l.voice_xp_ignore_solo),
      reset_on_leave: Boolean(l.reset_on_leave),
      reset_on_ban: Boolean(l.reset_on_ban),
      levelup_message_content: l.levelup_message_content || 'GG {user}, you leveled up to **Level {level}**! 🎉',
      levelup_embed_title: l.levelup_embed_title || '🎉 Level Up!',
      levelup_embed_description: l.levelup_embed_description || '{user} has reached **Level {level}**!',
      level_roles_stack: Boolean(l.level_roles_stack),
      level_roles: Array.isArray(l.level_roles) ? l.level_roles : []
    };
  } catch (err) {
    console.error('[Level] Error loading config:', err);
    if (window.Toast) Toast.error('Failed to load level configuration: ' + err.message);
  } finally {
    isInitialLoading = false;
    renderPage();
  }
};

window.renderLevelingModule = function(el, guildId) {
  return DashboardTabs.Level(el, guildId);
};
