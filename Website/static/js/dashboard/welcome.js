/**
 * Orbit Dashboard - Welcome & Goodbye Tab (/dashboard/:guildId/welcome)
 * Exact 1:1 PeakBot Welcome & Goodbye UI with live syntax-highlighted editors,
 * color pickers, emoji pickers, image upload/URL dropzones, live Discord previews,
 * auto-save, and functional Send Test / Test DM actions.
 */

DashboardTabs.Welcome = async function (container, guildId) {
  function esc(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const state = {
    guildName: 'My Server',
    memberCount: 128,
    botName: 'Orbit',
    botAvatar: '/img/logo.png',
    channels: [],
    welcome: {
      enabled: false,
      channel_id: '',
      embed: true,
      show_avatar: true,
      invite_vars: false,
      embed_color: '#5865F2',
      embed_author: '',
      embed_title: '',
      embed_description: '',
      embed_footer: '',
      embed_image: '',
      dm_enabled: false,
      dm_message: ''
    },
    goodbye: {
      enabled: false,
      channel_id: '',
      embed: true,
      embed_color: '#5865F2',
      embed_author: '',
      embed_title: '',
      embed_description: '',
      embed_footer: '',
      embed_image: '',
      dm_enabled: false,
      dm_message: ''
    }
  };

  let isInitialLoading = true;
  let saveTimer = null;
  let lastFocusedWelcomeInput = 'w-desc';
  let lastFocusedGoodbyeInput = 'g-desc';

  const PRESET_COLORS = [
    '#5865F2', '#3B82F6', '#06B6D4', '#10B981', '#22C55E',
    '#EAB308', '#F97316', '#EF4444', '#EC4899', '#A855F7', '#FFFFFF'
  ];

  const EMOJIS = [
    '👋', '🎉', '✨', '🔥', '❤️', '🚀', '👑', '🌟',
    '💎', '🥳', '🤝', '💬', '📌', '🔔', '🎮', '🏆',
    '😊', '🙌', '💫', '⚡', '😢', '💔', '🫡', '🚪'
  ];

  const STARTER_BADGE = `
    <span class="inline-flex items-center justify-center font-semibold uppercase tracking-[0.04em] leading-none tabular-nums select-none border align-middle whitespace-nowrap translate-y-px shadow-[0_1px_2px_-0.5px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] text-emerald-400 border-emerald-500/20 bg-gradient-to-b from-emerald-400/25 to-emerald-600/10 h-[19px] pl-[5px] pr-[6.5px] gap-[3px] rounded-[6px] text-[9.5px]">
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles shrink-0 -ml-px opacity-90" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>Starter
    </span>
  `;

  function renderSwitchHtml(id, checked) {
    return `
      <div class="flex items-center gap-3">
        <button type="button" id="${id}" role="switch" aria-checked="${checked ? 'true' : 'false'}" class="relative w-[40px] h-[22px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 after:content-[''] after:absolute after:-inset-y-2.5 after:-inset-x-1 ${checked ? 'bg-white' : 'bg-neutral-700'}">
          <span class="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-[16px] h-[16px] rounded-full shadow-sm transition-transform duration-200 ease-in-out will-change-transform ${checked ? 'translate-x-[21px] bg-black' : 'translate-x-[3px] bg-neutral-900'}"></span>
        </button>
      </div>
    `;
  }

  function highlightVariablesOverlay(text, placeholder) {
    if (!text) {
      return `<span style="color: rgba(115, 115, 115, 0.8);">${esc(placeholder)}</span>`;
    }
    const tokenColors = {
      '{user}': 'color:#a5b4fc;background:rgba(99,102,241,0.2);border-radius:4px;padding:0 2px;',
      '{user.displayName}': 'color:#a5b4fc;background:rgba(99,102,241,0.2);border-radius:4px;padding:0 2px;',
      '{server}': 'color:#86efac;background:rgba(34,197,94,0.2);border-radius:4px;padding:0 2px;',
      '{invite}': 'color:#67e8f9;background:rgba(6,182,212,0.2);border-radius:4px;padding:0 2px;',
      '{memberCount}': 'color:#fcd34d;background:rgba(245,158,11,0.2);border-radius:4px;padding:0 2px;',
      '{count}': 'color:#fcd34d;background:rgba(245,158,11,0.2);border-radius:4px;padding:0 2px;',
      '{inviter}': 'color:#fdba74;background:rgba(249,115,22,0.2);border-radius:4px;padding:0 2px;',
      '{inviter.name}': 'color:#fdba74;background:rgba(249,115,22,0.2);border-radius:4px;padding:0 2px;',
      '{inviter.count}': 'color:#fdba74;background:rgba(249,115,22,0.2);border-radius:4px;padding:0 2px;',
      '{invite.code}': 'color:#67e8f9;background:rgba(6,182,212,0.2);border-radius:4px;padding:0 2px;',
      '{account.age}': 'color:#d8b4fe;background:rgba(168,85,247,0.2);border-radius:4px;padding:0 2px;',
      '{time.in.server}': 'color:#d8b4fe;background:rgba(168,85,247,0.2);border-radius:4px;padding:0 2px;'
    };
    const regex = /(\{user\.displayName\}|\{user\}|\{server\}|\{invite\.code\}|\{invite\}|\{memberCount\}|\{count\}|\{inviter\.name\}|\{inviter\.count\}|\{inviter\}|\{account\.age\}|\{time\.in\.server\})/g;
    const parts = String(text).split(regex);
    return parts.map(part => {
      if (tokenColors[part]) {
        return `<span style="${tokenColors[part]}">${esc(part)}</span>`;
      }
      return esc(part);
    }).join('') + (String(text).endsWith('\n') ? '\n ' : '');
  }

  function renderPreviewTokens(text) {
    if (!text) return '';
    if (window.DiscordMarkdown && typeof window.DiscordMarkdown.parse === 'function') {
      return window.DiscordMarkdown.parse(text, {
        guildName: state.guildName,
        memberCount: state.memberCount,
        channels: state.allChannels && state.allChannels.length ? state.allChannels : state.channels,
        roles: state.roles || [],
        emojis: state.emojis || [],
        members: state.members || [],
        highlightVariables: true
      });
    }
    return renderPreviewTokensLegacy(text);
  }

  function renderPreviewTokensLegacy(text) {
    if (!text) return '';
    const map = {
      '{user}': `<span class="bg-[#5865f2]/30 text-[#c9cdfb] rounded-[3px] px-[2px]">@User</span>`,
      '{user.displayName}': `<span class="bg-[#5865f2]/30 text-[#c9cdfb] rounded-[3px] px-[2px]">User</span>`,
      '{server}': `<span class="bg-green-500/30 text-green-300 rounded-[3px] px-[2px]">${esc(state.guildName)}</span>`,
      '{invite}': `<span class="bg-cyan-500/30 text-cyan-300 rounded-[3px] px-[2px]">discord.gg/invite</span>`,
      '{invite.code}': `<span class="bg-cyan-500/30 text-cyan-300 rounded-[3px] px-[2px]">orbit</span>`,
      '{memberCount}': `<span class="bg-amber-500/30 text-amber-300 rounded-[3px] px-[2px]">${esc(state.memberCount)}</span>`,
      '{count}': `<span class="bg-amber-500/30 text-amber-300 rounded-[3px] px-[2px]">${esc(state.memberCount)}</span>`,
      '{inviter}': `<span class="bg-orange-500/30 text-orange-300 rounded-[3px] px-[2px]">@Inviter</span>`,
      '{inviter.name}': `<span class="bg-orange-500/30 text-orange-300 rounded-[3px] px-[2px]">Inviter</span>`,
      '{inviter.count}': `<span class="bg-orange-500/30 text-orange-300 rounded-[3px] px-[2px]">5</span>`,
      '{account.age}': `<span class="bg-purple-500/30 text-purple-300 rounded-[3px] px-[2px]">2 years</span>`,
      '{time.in.server}': `<span class="bg-purple-500/30 text-purple-300 rounded-[3px] px-[2px]">3 months</span>`
    };
    const regex = /(\{user\.displayName\}|\{user\}|\{server\}|\{invite\.code\}|\{invite\}|\{memberCount\}|\{count\}|\{inviter\.name\}|\{inviter\.count\}|\{inviter\}|\{account\.age\}|\{time\.in\.server\})/g;
    return String(text).split(regex).map(part => map[part] || `<span>${esc(part)}</span>`).join('');
  }

  function scheduleSave() {
    if (isInitialLoading) return;
    const statusEl = document.getElementById('welcome-save-status');
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
              statusEl.className = 'text-xs text-neutral-600 transition-colors';
            }
          }, 1800);
        }
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = 'Save failed';
          statusEl.className = 'text-xs text-red-400 transition-colors';
        }
      }
    }, 600);
  }

  async function saveNow() {
    const wPayload = {
      enabled: state.welcome.enabled,
      channel_id: state.welcome.channel_id || '',
      msg_mode: state.welcome.embed ? 'embed' : 'text',
      show_avatar: state.welcome.show_avatar,
      invite_vars: state.welcome.invite_vars,
      embed_color: state.welcome.embed_color || '#5865F2',
      embed_author: state.welcome.embed_author || '',
      embed_title: state.welcome.embed_title || '',
      embed_description: state.welcome.embed_description || '',
      embed_footer: state.welcome.embed_footer || '',
      message: state.welcome.embed_description || 'Welcome {user} to {server}!',
      embed_image: state.welcome.embed_image || '',
      image_url: state.welcome.embed_image || '',
      dm_enabled: state.welcome.dm_enabled,
      dm_message: state.welcome.dm_message || ''
    };

    const gPayload = {
      enabled: state.goodbye.enabled,
      channel_id: state.goodbye.channel_id || '',
      msg_mode: state.goodbye.embed ? 'embed' : 'text',
      embed_color: state.goodbye.embed_color || '#5865F2',
      embed_author: state.goodbye.embed_author || '',
      embed_title: state.goodbye.embed_title || '',
      embed_description: state.goodbye.embed_description || '',
      embed_footer: state.goodbye.embed_footer || '',
      message: state.goodbye.embed_description || '{user} left {server}.',
      embed_image: state.goodbye.embed_image || '',
      image_url: state.goodbye.embed_image || '',
      dm_enabled: state.goodbye.dm_enabled,
      dm_message: state.goodbye.dm_message || ''
    };

    await API.saveConfig(guildId, {
      welcome: wPayload,
      goodbye: gPayload
    });
  }

  function getChannelLabel(channelId) {
    if (!channelId) return '# Select channel';
    const found = state.channels.find(c => String(c.id) === String(channelId));
    return found ? `# ${found.name}` : '# Select channel';
  }

  function getChannelPureName(channelId, fallback) {
    if (!channelId) return fallback;
    const found = state.channels.find(c => String(c.id) === String(channelId));
    return found ? found.name : fallback;
  }

  function renderPage() {
    const wChanSelected = Boolean(state.welcome.channel_id);
    const gChanSelected = Boolean(state.goodbye.channel_id);
    const wTotalChars = (state.welcome.embed_author || '').length +
      (state.welcome.embed_title || '').length +
      (state.welcome.embed_description || '').length +
      (state.welcome.embed_footer || '').length;
    const gTotalChars = (state.goodbye.embed_author || '').length +
      (state.goodbye.embed_title || '').length +
      (state.goodbye.embed_description || '').length +
      (state.goodbye.embed_footer || '').length;

    container.innerHTML = `
      <div>
        <!-- Feature Header -->
        <div data-tour="feature-header" class="scroll-mt-24">
          <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </span>
              <h1 class="text-base font-medium text-white truncate">Welcome Messages</h1>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <span id="welcome-save-status" class="text-xs text-neutral-600 transition-colors">Auto-saved</span>
            </div>
          </div>
        </div>

        <!-- Welcome Section Grid -->
        <div class="mt-6">
          <div class="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-5 min-w-0">
            <!-- Left: Welcome Message Card -->
            <div class="flex flex-col gap-5 min-w-0">
              <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex-1 flex flex-col">
                <!-- Card Header -->
                <div class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <div class="flex items-center gap-2 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square w-4 h-4 flex-shrink-0 text-neutral-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <span class="text-sm font-medium text-white truncate">Welcome Message</span>
                  </div>
                  <div class="flex items-center gap-2.5 flex-shrink-0">
                    <!-- Welcome Channel Selector -->
                    <div data-tour="welcome-channel" class="w-36 sm:w-52 rounded-xl scroll-mt-24 transition-[box-shadow]">
                      <div class="w-full relative" id="w-channel-dropdown-wrap">
                        <button type="button" id="w-channel-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                          <span id="w-channel-label" class="min-w-0 truncate text-sm ${wChanSelected ? 'text-white font-medium' : 'text-neutral-500'}">${esc(getChannelLabel(state.welcome.channel_id))}</span>
                          <div class="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
                          </div>
                        </button>
                        <div id="w-channel-menu" data-lenis-prevent="true" style="z-index: 99999;" class="orbit-dropdown-menu hidden absolute right-0 mt-1.5 w-60 max-h-60 overflow-y-auto rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl z-[99999] py-1">
                          <button type="button" data-ch="" class="w-ch-opt w-full px-3 py-2 text-left text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"># No channel</button>
                          ${state.channels.map(c => `
                            <button type="button" data-ch="${esc(c.id)}" class="w-ch-opt w-full px-3 py-2 text-left text-xs ${String(state.welcome.channel_id) === String(c.id) ? 'bg-white/10 text-white font-semibold' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'} transition-colors truncate"># ${esc(c.name)}</button>
                          `).join('')}
                        </div>
                      </div>
                    </div>
                    <!-- Welcome Master Toggle -->
                    <span data-tour="feature-toggle" class="inline-flex scroll-mt-24">
                      ${renderSwitchHtml('w-enabled-switch', state.welcome.enabled)}
                    </span>
                  </div>
                </div>

                <!-- Card Body -->
                <div data-tour="welcome-message" class="scroll-mt-24 p-4 sm:p-5 space-y-3">
                  <div class="space-y-2.5">
                    <!-- Author / Header Row (Visible in Embed mode) -->
                    <div id="w-author-row" class="${state.welcome.embed ? 'flex' : 'hidden'} items-stretch gap-2">
                      <div class="flex-1 min-w-0">
                        <div class="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors" style="min-height: 42px;">
                          <div id="w-author-overlay" aria-hidden="true" class="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white text-[16px] leading-6 sm:text-[13px] sm:leading-5" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 10px 34px 10px 14px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 1;">${highlightVariablesOverlay(state.welcome.embed_author, '• Welcome to Archrealm!  (Author / Header)')}</div>
                          <textarea id="w-author-input" rows="1" class="relative block w-full resize-none focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 overflow-hidden" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 10px 34px 10px 14px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 2; box-shadow: none; color: transparent; -webkit-text-fill-color: transparent; caret-color: white;">${esc(state.welcome.embed_author)}</textarea>
                          <button type="button" data-emoji-target="w-author-input" title="Add emoji" aria-label="Add emoji" class="emoji-trigger-btn absolute right-2 z-[3] rounded-md p-1 text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-200 top-2.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile h-4 w-4"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
                          </button>
                        </div>
                      </div>
                      <div class="flex items-start">
                        <div class="relative flex flex-col" id="w-color-wrap">
                          <button type="button" id="w-color-btn" class="w-[42px] h-[42px] rounded-xl shadow-sm border border-neutral-700 hover:border-neutral-500 transition-colors cursor-pointer flex-shrink-0" style="background-color: ${esc(state.welcome.embed_color)};"></button>
                          <div id="w-color-popover" class="hidden absolute right-0 top-12 z-40 w-52 p-3 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl space-y-2.5">
                            <div class="grid grid-cols-6 gap-1.5">
                              ${PRESET_COLORS.map(c => `
                                <button type="button" data-color="${c}" class="w-color-preset w-6 h-6 rounded-lg border border-white/10 hover:scale-110 transition-transform" style="background-color:${c};"></button>
                              `).join('')}
                            </div>
                            <div class="flex items-center gap-2 pt-1 border-t border-neutral-800">
                              <input type="color" id="w-color-native" value="${esc(state.welcome.embed_color)}" class="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0">
                              <input type="text" id="w-color-hex" value="${esc(state.welcome.embed_color)}" maxlength="7" class="flex-1 px-2 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white font-mono focus:outline-none">
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Title Row (Visible in Embed mode) -->
                    <div id="w-title-row" class="${state.welcome.embed ? 'block' : 'hidden'}">
                      <div class="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors" style="min-height: 42px;">
                        <div id="w-title-overlay" aria-hidden="true" class="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white text-[16px] leading-6 sm:text-[13px] sm:leading-5" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 10px 34px 10px 14px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 1;">${highlightVariablesOverlay(state.welcome.embed_title, '***{user} Explore the server.***  (Title)')}</div>
                        <textarea id="w-title-input" rows="1" class="relative block w-full resize-none focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 overflow-hidden" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 10px 34px 10px 14px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 2; box-shadow: none; color: transparent; -webkit-text-fill-color: transparent; caret-color: white;">${esc(state.welcome.embed_title)}</textarea>
                        <button type="button" data-emoji-target="w-title-input" title="Add emoji" aria-label="Add emoji" class="emoji-trigger-btn absolute right-2 z-[3] rounded-md p-1 text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-200 top-2.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile h-4 w-4"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
                        </button>
                      </div>
                    </div>

                    <!-- Description Textarea -->
                    <div id="w-desc-row" class="block">
                      <div class="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors" style="min-height: 84px;">
                        <div id="w-desc-overlay" aria-hidden="true" class="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white text-[16px] leading-6 sm:text-[13px] sm:leading-5" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 12px 34px 12px 16px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 1;">${highlightVariablesOverlay(state.welcome.embed_description, 'Welcome {user} to {server}!  (Description)')}</div>
                        <textarea id="w-desc-input" rows="3" class="relative block w-full resize-none focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 overflow-hidden" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 12px 34px 12px 16px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 2; box-shadow: none; color: transparent; -webkit-text-fill-color: transparent; caret-color: white;">${esc(state.welcome.embed_description)}</textarea>
                        <button type="button" data-emoji-target="w-desc-input" title="Add emoji" aria-label="Add emoji" class="emoji-trigger-btn absolute right-2 z-[3] rounded-md p-1 text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-200 bottom-2.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile h-4 w-4"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
                        </button>
                      </div>
                    </div>

                    <!-- Footer Row (Visible in Embed mode) -->
                    <div id="w-footer-row" class="${state.welcome.embed ? 'block' : 'hidden'}">
                      <div class="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors" style="min-height: 42px;">
                        <div id="w-footer-overlay" aria-hidden="true" class="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white text-[16px] leading-6 sm:text-[13px] sm:leading-5" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 10px 34px 10px 14px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 1;">${highlightVariablesOverlay(state.welcome.embed_footer, 'Footer text (optional)')}</div>
                        <textarea id="w-footer-input" rows="1" class="relative block w-full resize-none focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 overflow-hidden" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 10px 34px 10px 14px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 2; box-shadow: none; color: transparent; -webkit-text-fill-color: transparent; caret-color: white;">${esc(state.welcome.embed_footer)}</textarea>
                        <button type="button" data-emoji-target="w-footer-input" title="Add emoji" aria-label="Add emoji" class="emoji-trigger-btn absolute right-2 z-[3] rounded-md p-1 text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-200 top-2.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile h-4 w-4"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Variable Chips + Counter -->
                  <div class="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                    <div id="w-var-chips" class="flex items-center gap-1 flex-wrap">
                      <button type="button" data-var="{user}" title="Insert {user}" class="w-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20">@User</button>
                      <button type="button" data-var="{user.displayName}" title="Insert {user.displayName}" class="w-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20">@Display Name</button>
                      <button type="button" data-var="{server}" title="Insert {server}" class="w-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-green-500/20 text-green-300 hover:bg-green-500/25 border border-green-500/20">@Server</button>
                      <button type="button" data-var="{invite}" title="Insert {invite}" class="w-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/20">@invite</button>
                      <button type="button" data-var="{memberCount}" title="Insert {memberCount}" class="w-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/25 border border-amber-500/20">@Members</button>
                      <span id="w-extra-invite-chips" class="${state.welcome.invite_vars ? 'inline-flex' : 'hidden'} items-center gap-1 flex-wrap">
                        <button type="button" data-var="{inviter}" title="Insert {inviter}" class="w-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer bg-orange-500/20 text-orange-300 hover:bg-orange-500/25 border border-orange-500/20">@inviter</button>
                        <button type="button" data-var="{inviter.name}" title="Insert {inviter.name}" class="w-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer bg-orange-500/20 text-orange-300 hover:bg-orange-500/25 border border-orange-500/20">@inviter.name</button>
                        <button type="button" data-var="{inviter.count}" title="Insert {inviter.count}" class="w-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer bg-orange-500/20 text-orange-300 hover:bg-orange-500/25 border border-orange-500/20">@inviter.count</button>
                        <button type="button" data-var="{invite.code}" title="Insert {invite.code}" class="w-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/20">@invite.code</button>
                        <button type="button" data-var="{account.age}" title="Insert {account.age}" class="w-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer bg-purple-500/20 text-purple-300 hover:bg-purple-500/25 border border-purple-500/20">@account.age</button>
                      </span>
                    </div>
                    <span id="w-char-count" class="text-[11px] tabular-nums flex-shrink-0 ml-2 ${wTotalChars > 2000 ? 'text-red-400' : 'text-neutral-600'}">${wTotalChars}/2000</span>
                  </div>

                  <!-- Toggles Row -->
                  <div class="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 border-t border-neutral-800/60">
                    <label class="inline-flex items-center gap-2 cursor-pointer">
                      <span class="text-[12px] text-neutral-300">Embed</span>
                      ${renderSwitchHtml('w-embed-switch', state.welcome.embed)}
                    </label>
                    <label class="inline-flex items-center gap-2 cursor-pointer">
                      <span class="text-[12px] text-neutral-300">User Avatar</span>
                      ${renderSwitchHtml('w-avatar-switch', state.welcome.show_avatar)}
                    </label>
                    <label class="inline-flex items-center gap-2 cursor-pointer" title="Unlocks {inviter}, {inviter.name}, {inviter.count}, {invite.code} and {account.age}. Invite tracking must be enabled.">
                      <span class="text-[12px] text-neutral-300">Invite Variables</span>
                      ${renderSwitchHtml('w-invitevars-switch', state.welcome.invite_vars)}
                    </label>
                  </div>

                  <!-- Embed Image Upload / URL -->
                  <div class="relative flex flex-col flex-1">
                    <div class="space-y-1.5">
                      <div class="flex items-center gap-1.5">
                        <label class="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Embed Image</label>
                        ${STARTER_BADGE}
                      </div>
                      <div class="space-y-1.5">
                        <div id="w-img-dropzone" class="relative rounded-xl border border-dashed transition-all overflow-hidden h-24 flex flex-col items-center justify-center border-neutral-700 hover:border-neutral-600 bg-neutral-800/40 cursor-pointer">
                          ${state.welcome.embed_image ? `
                            <img src="${esc(state.welcome.embed_image)}" alt="Welcome Embed" class="w-full h-full object-cover">
                            <button type="button" id="w-img-remove-btn" class="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-neutral-300 hover:text-red-400 transition-colors z-10" title="Remove image">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                            </button>
                          ` : `
                            <div class="flex flex-col items-center justify-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload w-5 h-5 text-neutral-500 mb-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
                              <span class="text-sm font-medium text-neutral-300">Click or drop an image</span>
                              <span class="text-[10px] text-neutral-500 mt-0.5">PNG · JPG · WebP · GIF · up to 4 MB</span>
                            </div>
                          `}
                          <button type="button" id="w-img-url-btn" class="absolute bottom-2 right-2.5 inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[32px] rounded-md bg-neutral-700/80 hover:bg-neutral-700 text-[11px] text-neutral-300 hover:text-white transition-colors z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link w-3 h-3"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>Use URL
                          </button>
                          <input id="w-img-file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" type="file">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Preview Footer -->
                <div class="border-t border-neutral-800">
                  <div class="px-4 sm:px-5 py-3 flex items-center justify-between">
                    <span class="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Preview</span>
                    <button type="button" id="w-send-test-btn" ${wChanSelected ? '' : 'disabled=""'} class="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-[transform,background-color,color,border-color] duration-150 ease-out enabled:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 focus-visible:ring-green-500/40 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-3 h-3"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>Send Test
                    </button>
                  </div>
                  <div class="mx-4 sm:mx-5 mb-4 sm:mb-5">
                    <div class="rounded-xl overflow-hidden border border-neutral-700/30">
                      <div class="bg-[#2f3136] px-4 py-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-3.5 h-3.5 text-neutral-400"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
                        <span id="w-preview-channel-name" class="text-xs font-semibold text-white">${esc(getChannelPureName(state.welcome.channel_id, 'welcome'))}</span>
                      </div>
                      <div class="bg-[#313338] px-4 pt-3 pb-4 space-y-2.5">
                        <div class="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 16 16" class="text-green-500 flex-shrink-0"><path fill="currentColor" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.5 7.5h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 1 0v3h3a.5.5 0 0 1 0 1z"></path></svg>
                          <p class="text-xs text-neutral-500"><span class="font-medium text-white hover:underline cursor-pointer">@User</span> joined the server.</p>
                        </div>
                        <div id="w-preview-bot-wrap" class="flex gap-2.5 ${state.welcome.enabled ? 'opacity-100' : 'opacity-40'} transition-opacity">
                          <img src="${esc(state.botAvatar)}" alt="${esc(state.botName)}" class="w-8 h-8 rounded-full flex-shrink-0 object-cover mt-0.5">
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1.5 mb-0.5 min-w-0">
                              <span class="text-xs font-semibold text-indigo-400 whitespace-nowrap">${esc(state.botName)}</span>
                              <span class="inline-flex flex-shrink-0 items-center gap-[0.15em] px-1 py-px text-[10px] font-bold bg-[#5865F2] text-white rounded leading-none">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="h-[0.85em] w-[0.85em]"><path d="M20 6 9 17l-5-5"></path></svg>APP
                              </span>
                              <span class="text-xs text-neutral-500 truncate">Today at 12:00 PM</span>
                            </div>
                            <div id="w-preview-body"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: DM on Join Card -->
            <div class="lg:order-last flex flex-col">
              <div class="flex flex-col gap-5 flex-1">
                <div class="relative flex flex-col rounded-2xl flex-1">
                  <div class="flex flex-col flex-1">
                    <div data-tour="welcome-dm" class="rounded-2xl bg-neutral-900 border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] p-4 scroll-mt-24 flex-1 flex flex-col">
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail w-4 h-4 text-neutral-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                          <span class="text-sm font-medium text-white">DM on Join</span>
                          ${STARTER_BADGE}
                        </div>
                        ${renderSwitchHtml('w-dm-switch', state.welcome.dm_enabled)}
                      </div>
                      <div class="transition-all duration-200 flex-1 flex flex-col min-h-0">
                        <div class="flex-1 min-h-0 flex flex-col">
                          <div class="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors h-full flex flex-col" style="min-height: 104px;">
                            <div id="w-dm-overlay" aria-hidden="true" class="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white h-full text-[16px] leading-6 sm:text-[13px] sm:leading-5" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 12px 34px 12px 16px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 1;">${highlightVariablesOverlay(state.welcome.dm_message, '👋 Welcome to {server} (default)')}</div>
                            <textarea id="w-dm-input" rows="4" class="relative block w-full resize-none focus:outline-none bg-transparent flex-1 overflow-y-auto text-[16px] leading-6 sm:text-[13px] sm:leading-5" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 12px 34px 12px 16px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 2; box-shadow: none; color: transparent; -webkit-text-fill-color: transparent; caret-color: white;">${esc(state.welcome.dm_message)}</textarea>
                            <button type="button" data-emoji-target="w-dm-input" title="Add emoji" aria-label="Add emoji" class="emoji-trigger-btn absolute right-2 z-[3] rounded-md p-1 text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-200 bottom-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile h-4 w-4"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
                            </button>
                          </div>
                        </div>
                        <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <button type="button" data-var="{user}" title="Insert {user}" class="w-dm-chip px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20">@User</button>
                          <button type="button" data-var="{user.displayName}" title="Insert {user.displayName}" class="w-dm-chip px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20">@Display Name</button>
                          <button type="button" data-var="{server}" title="Insert {server}" class="w-dm-chip px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-green-500/20 text-green-300 hover:bg-green-500/25 border border-green-500/20">@Server</button>
                          <button type="button" data-var="{invite}" title="Insert {invite}" class="w-dm-chip px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/20">@invite</button>
                          <button type="button" data-var="{memberCount}" title="Insert {memberCount}" class="w-dm-chip px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/25 border border-amber-500/20">@Members</button>
                        </div>
                        <div class="mt-2.5 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between gap-3">
                          <span class="text-[10px] text-neutral-600 italic truncate min-w-0">Auto-appended: <span class="not-italic text-neutral-500">-# Sent from {server}</span></span>
                          <div class="flex items-center gap-2 flex-shrink-0">
                            <span id="w-dm-char-count" class="text-[11px] tabular-nums text-neutral-600">${(state.welcome.dm_message || '').length}/2000</span>
                            <button type="button" id="w-test-dm-btn" class="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-[transform,background-color,color,border-color] duration-150 ease-out enabled:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 focus-visible:ring-purple-500/40 cursor-pointer">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-3 h-3"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>Test DM
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Goodbye Section Grid -->
        <div class="mt-5 pt-5 border-t border-neutral-800">
          <div class="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-5 min-w-0">
            <!-- Left: Goodbye Messages Card -->
            <div class="space-y-5 min-w-0">
              <div class="bg-neutral-900 rounded-2xl border border-neutral-800">
                <!-- Header -->
                <div class="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-neutral-800">
                  <div class="flex items-center gap-2 min-w-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-minus w-4 h-4 flex-shrink-0 text-neutral-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="22" x2="16" y1="11" y2="11"></line></svg>
                    <span class="text-sm font-medium text-white truncate">Goodbye Messages</span>
                  </div>
                  <div class="flex items-center gap-2.5 flex-shrink-0">
                    <div class="w-36 sm:w-52 rounded-xl transition-all">
                      <div class="w-full relative" id="g-channel-dropdown-wrap">
                        <button type="button" id="g-channel-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                          <span id="g-channel-label" class="min-w-0 truncate text-sm ${gChanSelected ? 'text-white font-medium' : 'text-neutral-500'}">${esc(getChannelLabel(state.goodbye.channel_id))}</span>
                          <div class="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
                          </div>
                        </button>
                        <div id="g-channel-menu" data-lenis-prevent="true" style="z-index: 99999;" class="orbit-dropdown-menu hidden absolute right-0 mt-1.5 w-60 max-h-60 overflow-y-auto rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl z-[99999] py-1">
                          <button type="button" data-ch="" class="g-ch-opt w-full px-3 py-2 text-left text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"># No channel</button>
                          ${state.channels.map(c => `
                            <button type="button" data-ch="${esc(c.id)}" class="g-ch-opt w-full px-3 py-2 text-left text-xs ${String(state.goodbye.channel_id) === String(c.id) ? 'bg-white/10 text-white font-semibold' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'} transition-colors truncate"># ${esc(c.name)}</button>
                          `).join('')}
                        </div>
                      </div>
                    </div>
                    ${renderSwitchHtml('g-enabled-switch', state.goodbye.enabled)}
                  </div>
                </div>

                <!-- Body -->
                <div class="p-4 sm:p-5 space-y-3">
                  <div class="space-y-2.5">
                    <!-- Goodbye Author / Header Row (Visible in Embed mode) -->
                    <div id="g-author-row" class="${state.goodbye.embed ? 'flex' : 'hidden'} items-stretch gap-2">
                      <div class="flex-1 min-w-0">
                        <div class="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors" style="min-height: 42px;">
                          <div id="g-author-overlay" aria-hidden="true" class="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white text-[16px] leading-6 sm:text-[13px] sm:leading-5" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 10px 34px 10px 14px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 1;">${highlightVariablesOverlay(state.goodbye.embed_author, '• Goodbye! (Author / Header)')}</div>
                          <textarea id="g-author-input" rows="1" class="relative block w-full resize-none focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 overflow-hidden" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 10px 34px 10px 14px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 2; box-shadow: none; color: transparent; -webkit-text-fill-color: transparent; caret-color: white;">${esc(state.goodbye.embed_author)}</textarea>
                          <button type="button" data-emoji-target="g-author-input" title="Add emoji" aria-label="Add emoji" class="emoji-trigger-btn absolute right-2 z-[3] rounded-md p-1 text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-200 top-2.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile h-4 w-4"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
                          </button>
                        </div>
                      </div>
                      <div class="flex items-start">
                        <div class="relative flex flex-col" id="g-color-wrap">
                          <button type="button" id="g-color-btn" class="w-[42px] h-[42px] rounded-xl shadow-sm border border-neutral-700 hover:border-neutral-500 transition-colors cursor-pointer flex-shrink-0" style="background-color: ${esc(state.goodbye.embed_color)};"></button>
                          <div id="g-color-popover" class="hidden absolute right-0 top-12 z-40 w-52 p-3 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl space-y-2.5">
                            <div class="grid grid-cols-6 gap-1.5">
                              ${PRESET_COLORS.map(c => `
                                <button type="button" data-color="${c}" class="g-color-preset w-6 h-6 rounded-lg border border-white/10 hover:scale-110 transition-transform" style="background-color:${c};"></button>
                              `).join('')}
                            </div>
                            <div class="flex items-center gap-2 pt-1 border-t border-neutral-800">
                              <input type="color" id="g-color-native" value="${esc(state.goodbye.embed_color)}" class="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0">
                              <input type="text" id="g-color-hex" value="${esc(state.goodbye.embed_color)}" maxlength="7" class="flex-1 px-2 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-white font-mono focus:outline-none">
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Goodbye Title Row (Visible in Embed mode) -->
                    <div id="g-title-row" class="${state.goodbye.embed ? 'block' : 'hidden'}">
                      <div class="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors" style="min-height: 42px;">
                        <div id="g-title-overlay" aria-hidden="true" class="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white text-[16px] leading-6 sm:text-[13px] sm:leading-5" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 10px 34px 10px 14px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 1;">${highlightVariablesOverlay(state.goodbye.embed_title, '***{user} left the server.*** (Title)')}</div>
                        <textarea id="g-title-input" rows="1" class="relative block w-full resize-none focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 overflow-hidden" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 10px 34px 10px 14px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 2; box-shadow: none; color: transparent; -webkit-text-fill-color: transparent; caret-color: white;">${esc(state.goodbye.embed_title)}</textarea>
                        <button type="button" data-emoji-target="g-title-input" title="Add emoji" aria-label="Add emoji" class="emoji-trigger-btn absolute right-2 z-[3] rounded-md p-1 text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-200 top-2.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile h-4 w-4"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
                        </button>
                      </div>
                    </div>

                    <!-- Goodbye Description -->
                    <div id="g-desc-row" class="block">
                      <div class="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors" style="min-height: 84px;">
                        <div id="g-desc-overlay" aria-hidden="true" class="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white text-[16px] leading-6 sm:text-[13px] sm:leading-5" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 12px 34px 12px 16px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 1;">${highlightVariablesOverlay(state.goodbye.embed_description, 'Goodbye {user}! (Description)')}</div>
                        <textarea id="g-desc-input" rows="3" class="relative block w-full resize-none focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 overflow-hidden" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 12px 34px 12px 16px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 2; box-shadow: none; color: transparent; -webkit-text-fill-color: transparent; caret-color: white;">${esc(state.goodbye.embed_description)}</textarea>
                        <button type="button" data-emoji-target="g-desc-input" title="Add emoji" aria-label="Add emoji" class="emoji-trigger-btn absolute right-2 z-[3] rounded-md p-1 text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-200 bottom-2.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile h-4 w-4"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
                        </button>
                      </div>
                    </div>

                    <!-- Goodbye Footer Row (Visible in Embed mode) -->
                    <div id="g-footer-row" class="${state.goodbye.embed ? 'block' : 'hidden'}">
                      <div class="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors" style="min-height: 42px;">
                        <div id="g-footer-overlay" aria-hidden="true" class="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white text-[16px] leading-6 sm:text-[13px] sm:leading-5" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 10px 34px 10px 14px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 1;">${highlightVariablesOverlay(state.goodbye.embed_footer, 'Footer text (optional)')}</div>
                        <textarea id="g-footer-input" rows="1" class="relative block w-full resize-none focus:outline-none bg-transparent text-[16px] leading-6 sm:text-[13px] sm:leading-5 overflow-hidden" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 10px 34px 10px 14px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 2; box-shadow: none; color: transparent; -webkit-text-fill-color: transparent; caret-color: white;">${esc(state.goodbye.embed_footer)}</textarea>
                        <button type="button" data-emoji-target="g-footer-input" title="Add emoji" aria-label="Add emoji" class="emoji-trigger-btn absolute right-2 z-[3] rounded-md p-1 text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-200 top-2.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile h-4 w-4"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Goodbye Variable Chips -->
                  <div class="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                    <div class="flex items-center gap-1 flex-wrap">
                      <button type="button" data-var="{user}" title="Insert {user}" class="g-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20">@User</button>
                      <button type="button" data-var="{user.displayName}" title="Insert {user.displayName}" class="g-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20">@Display Name</button>
                      <button type="button" data-var="{server}" title="Insert {server}" class="g-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-green-500/20 text-green-300 hover:bg-green-500/25 border border-green-500/20">@Server</button>
                      <button type="button" data-var="{memberCount}" title="Insert {memberCount}" class="g-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/25 border border-amber-500/20">@Members</button>
                      <button type="button" data-var="{invite}" title="Insert {invite}" class="g-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-orange-500/20 text-orange-300 hover:bg-orange-500/25 border border-orange-500/20">@invite</button>
                      <button type="button" data-var="{inviter.name}" title="Insert {inviter.name}" class="g-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-orange-500/20 text-orange-300 hover:bg-orange-500/25 border border-orange-500/20">@inviter.name</button>
                      <button type="button" data-var="{time.in.server}" title="Insert {time.in.server}" class="g-var-chip px-1.5 py-0.5 text-xs font-medium rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/25 border border-purple-500/20">@time.in.server</button>
                    </div>
                    <span id="g-char-count" class="text-xs tabular-nums flex-shrink-0 ml-2 ${gTotalChars > 2000 ? 'text-red-400' : 'text-neutral-600'}">${gTotalChars}/2000</span>
                  </div>

                  <!-- Goodbye Embed Toggle -->
                  <div class="flex items-center gap-2 pt-2 border-t border-neutral-800/60">
                    <label class="inline-flex items-center gap-2 cursor-pointer">
                      <span class="text-[12px] text-neutral-300">Embed</span>
                      ${renderSwitchHtml('g-embed-switch', state.goodbye.embed)}
                    </label>
                  </div>

                  <!-- Goodbye Embed Image -->
                  <div class="relative flex flex-col flex-1">
                    <div class="space-y-1.5">
                      <div class="flex items-center gap-1.5">
                        <label class="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Embed Image</label>
                        ${STARTER_BADGE}
                      </div>
                      <div class="space-y-1.5">
                        <div id="g-img-dropzone" class="relative rounded-xl border border-dashed transition-all overflow-hidden h-24 flex flex-col items-center justify-center border-neutral-700 hover:border-neutral-600 bg-neutral-800/40 cursor-pointer">
                          ${state.goodbye.embed_image ? `
                            <img src="${esc(state.goodbye.embed_image)}" alt="Goodbye Embed" class="w-full h-full object-cover">
                            <button type="button" id="g-img-remove-btn" class="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-neutral-300 hover:text-red-400 transition-colors z-10" title="Remove image">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                            </button>
                          ` : `
                            <div class="flex flex-col items-center justify-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload w-5 h-5 text-neutral-500 mb-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
                              <span class="text-sm font-medium text-neutral-300">Click or drop an image</span>
                              <span class="text-[10px] text-neutral-500 mt-0.5">PNG · JPG · WebP · GIF · up to 4 MB</span>
                            </div>
                          `}
                          <button type="button" id="g-img-url-btn" class="absolute bottom-2 right-2.5 inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[32px] rounded-md bg-neutral-700/80 hover:bg-neutral-700 text-[11px] text-neutral-300 hover:text-white transition-colors z-10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link w-3 h-3"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>Use URL
                          </button>
                          <input id="g-img-file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" type="file">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Goodbye Preview Footer -->
                <div class="border-t border-neutral-800">
                  <div class="px-4 sm:px-5 py-3 flex items-center justify-between">
                    <span class="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">Preview</span>
                    <button type="button" id="g-send-test-btn" ${gChanSelected ? '' : 'disabled=""'} class="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-[transform,background-color,color,border-color] duration-150 ease-out enabled:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 focus-visible:ring-green-500/40 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-3 h-3"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>Send Test
                    </button>
                  </div>
                  <div class="mx-4 sm:mx-5 mb-4 sm:mb-5">
                    <div class="rounded-xl overflow-hidden border border-neutral-700/30">
                      <div class="bg-[#2f3136] px-4 py-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-3.5 h-3.5 text-neutral-400"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>
                        <span id="g-preview-channel-name" class="text-xs font-semibold text-white">${esc(getChannelPureName(state.goodbye.channel_id, 'goodbye'))}</span>
                      </div>
                      <div class="bg-[#313338] px-4 pt-3 pb-4 space-y-2.5">
                        <div class="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 16 16" class="text-red-500 flex-shrink-0"><path fill="currentColor" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.5 8h-7a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1z"></path></svg>
                          <p class="text-xs text-neutral-500"><span class="font-medium text-white hover:underline cursor-pointer">SomeUser</span> left the server.</p>
                        </div>
                        <div id="g-preview-bot-wrap" class="flex gap-2.5 ${state.goodbye.enabled ? 'opacity-100' : 'opacity-40'} transition-opacity">
                          <img src="${esc(state.botAvatar)}" alt="${esc(state.botName)}" class="w-8 h-8 rounded-full flex-shrink-0 object-cover mt-0.5">
                          <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-1.5 mb-0.5 min-w-0">
                              <span class="text-xs font-semibold text-indigo-400 whitespace-nowrap">${esc(state.botName)}</span>
                              <span class="inline-flex flex-shrink-0 items-center gap-[0.15em] px-1 py-px text-[10px] font-bold bg-[#5865F2] text-white rounded leading-none">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="h-[0.85em] w-[0.85em]"><path d="M20 6 9 17l-5-5"></path></svg>APP
                              </span>
                              <span class="text-xs text-neutral-500 truncate">Today at 12:00 PM</span>
                            </div>
                            <div id="g-preview-body"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: DM on Leave Card -->
            <div class="order-first lg:order-last flex flex-col">
              <div class="flex flex-col gap-4 flex-1">
                <div class="relative flex flex-col rounded-2xl flex-1">
                  <div class="flex flex-col flex-1">
                    <div class="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 flex-1 flex flex-col">
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail w-4 h-4 text-neutral-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                          <span class="text-sm font-medium text-white">DM on Leave</span>
                          ${STARTER_BADGE}
                        </div>
                        ${renderSwitchHtml('g-dm-switch', state.goodbye.dm_enabled)}
                      </div>
                      <div class="transition-all duration-200 flex-1 flex flex-col min-h-0">
                        <div class="flex-1 min-h-0 flex flex-col">
                          <div class="relative rounded-xl border border-neutral-700/50 bg-neutral-800/50 focus-within:border-neutral-500 transition-colors h-full flex flex-col" style="min-height: 84px;">
                            <div id="g-dm-overlay" aria-hidden="true" class="absolute inset-0 pointer-events-none overflow-hidden rounded-xl text-white h-full text-[16px] leading-6 sm:text-[13px] sm:leading-5" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 12px 34px 12px 16px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 1;">${highlightVariablesOverlay(state.goodbye.dm_message, '👋 You left {server} (default)')}</div>
                            <textarea id="g-dm-input" rows="3" class="relative block w-full resize-none focus:outline-none bg-transparent flex-1 overflow-y-auto text-[16px] leading-6 sm:text-[13px] sm:leading-5" style="font-family: &quot;Cascadia Code&quot;, &quot;Fira Code&quot;, &quot;JetBrains Mono&quot;, Consolas, Monaco, monospace; padding: 12px 34px 12px 16px; letter-spacing: 0px; word-break: break-word; overflow-wrap: break-word; white-space: pre-wrap; box-sizing: border-box; margin: 0px; z-index: 2; box-shadow: none; color: transparent; -webkit-text-fill-color: transparent; caret-color: white;">${esc(state.goodbye.dm_message)}</textarea>
                            <button type="button" data-emoji-target="g-dm-input" title="Add emoji" aria-label="Add emoji" class="emoji-trigger-btn absolute right-2 z-[3] rounded-md p-1 text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-neutral-200 bottom-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile h-4 w-4"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
                            </button>
                          </div>
                        </div>
                        <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <button type="button" data-var="{user}" title="Insert {user}" class="g-dm-chip px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20">@User</button>
                          <button type="button" data-var="{user.displayName}" title="Insert {user.displayName}" class="g-dm-chip px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/20">@Display Name</button>
                          <button type="button" data-var="{server}" title="Insert {server}" class="g-dm-chip px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-green-500/20 text-green-300 hover:bg-green-500/25 border border-green-500/20">@Server</button>
                          <button type="button" data-var="{memberCount}" title="Insert {memberCount}" class="g-dm-chip px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/25 border border-amber-500/20">@Members</button>
                          <button type="button" data-var="{invite}" title="Insert {invite}" class="g-dm-chip px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-orange-500/20 text-orange-300 hover:bg-orange-500/25 border border-orange-500/20">@invite</button>
                          <button type="button" data-var="{inviter.name}" title="Insert {inviter.name}" class="g-dm-chip px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-orange-500/20 text-orange-300 hover:bg-orange-500/25 border border-orange-500/20">@inviter.name</button>
                          <button type="button" data-var="{time.in.server}" title="Insert {time.in.server}" class="g-dm-chip px-2 py-1 text-xs font-medium rounded-md transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/25 border border-purple-500/20">@time.in.server</button>
                        </div>
                        <div class="mt-2.5 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between gap-3">
                          <span class="text-[10px] text-neutral-600 italic truncate min-w-0">Auto-appended: <span class="not-italic text-neutral-500">-# Sent from {server}</span></span>
                          <div class="flex items-center gap-2 flex-shrink-0">
                            <span id="g-dm-char-count" class="text-[11px] tabular-nums text-neutral-600">${(state.goodbye.dm_message || '').length}/2000</span>
                            <button type="button" id="g-test-dm-btn" class="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-[transform,background-color,color,border-color] duration-150 ease-out enabled:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 focus-visible:ring-purple-500/40 cursor-pointer">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-3 h-3"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>Test DM
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Shared Floating Emoji Picker -->
        <div id="welcome-emoji-popover" class="hidden fixed z-50 w-60 p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl">
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5 px-1">Insert Emoji</p>
          <div class="grid grid-cols-6 gap-1">
            ${EMOJIS.map(em => `
              <button type="button" data-emoji="${em}" class="welcome-emoji-item h-8 rounded-lg hover:bg-neutral-800 flex items-center justify-center text-base transition-colors cursor-pointer">${em}</button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    updateWelcomePreview();
    updateGoodbyePreview();
    bindEvents();
  }

  function updateWelcomePreview() {
    const bodyEl = document.getElementById('w-preview-body');
    if (!bodyEl) return;

    const rawAuthor = state.welcome.embed_author;
    const rawTitle = state.welcome.embed_title;
    const rawDesc = state.welcome.embed_description;
    const rawFooter = state.welcome.embed_footer;
    const isDefault = !rawAuthor && !rawTitle && !rawDesc && !rawFooter;

    if (!state.welcome.embed) {
      const textVal = rawDesc || 'Welcome {user} to {server}! Enjoy your stay.';
      bodyEl.innerHTML = `
        <div class="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap break-words">${renderPreviewTokens(textVal)}</div>
      `;
      return;
    }

    const authorHtml = rawAuthor ? renderPreviewTokens(rawAuthor) : '';
    const titleHtml = rawTitle
      ? renderPreviewTokens(rawTitle)
      : (isDefault ? `<span>Welcome to </span><span class="bg-green-500/30 text-green-300 rounded-[3px] px-[2px]">${esc(state.guildName)}</span><span>!</span>` : '');
    const descHtml = rawDesc
      ? renderPreviewTokens(rawDesc)
      : (isDefault ? `<span>Welcome </span><span class="bg-[#5865f2]/30 text-[#c9cdfb] rounded-[3px] px-[2px]">@User</span><span>! Glad you're here.</span>` : '');
    const footerHtml = rawFooter ? renderPreviewTokens(rawFooter) : '';

    bodyEl.innerHTML = `
      <div class="border-l-[3px] rounded-r bg-[#2b2d31] max-w-full sm:max-w-[420px]" style="border-color: ${esc(state.welcome.embed_color || '#5865F2')};">
        <div class="p-2.5 flex flex-col gap-2">
          ${authorHtml ? `
            <div class="text-[11px] font-semibold text-white break-words">${authorHtml}</div>
          ` : ''}
          <div class="flex gap-2.5">
            <div class="flex-1 min-w-0 space-y-1">
              ${titleHtml ? `<p class="text-xs font-semibold text-white leading-snug break-words">${titleHtml}</p>` : ''}
              ${descHtml ? `<p class="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap break-words">${descHtml}</p>` : ''}
              ${isDefault ? `<p class="text-xs text-neutral-600 italic">Start typing to customize...</p>` : ''}
            </div>
            ${state.welcome.show_avatar ? `
              <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-700 grid place-items-center">
                <span class="text-[9px] font-semibold text-neutral-400">USER</span>
              </div>
            ` : ''}
          </div>
          ${state.welcome.embed_image ? `
            <img src="${esc(state.welcome.embed_image)}" alt="Embed preview" class="w-full max-h-48 object-cover rounded-lg border border-neutral-800/60 mt-0.5">
          ` : ''}
          ${footerHtml ? `
            <div class="pt-0.5 text-[10px] text-neutral-400 break-words">${footerHtml}</div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function updateGoodbyePreview() {
    const bodyEl = document.getElementById('g-preview-body');
    if (!bodyEl) return;

    const rawAuthor = state.goodbye.embed_author;
    const rawTitle = state.goodbye.embed_title;
    const rawDesc = state.goodbye.embed_description;
    const rawFooter = state.goodbye.embed_footer;

    if (!state.goodbye.embed) {
      const textVal = rawDesc || '{user} left {server}.';
      bodyEl.innerHTML = `
        <div class="text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap break-words">${renderPreviewTokens(textVal)}</div>
      `;
      return;
    }

    if (!rawAuthor && !rawTitle && !rawDesc && !rawFooter && !state.goodbye.embed_image) {
      bodyEl.innerHTML = `
        <div class="border-l-[3px] rounded-r bg-[#2b2d31] max-w-full sm:max-w-[420px]" style="border-color: ${esc(state.goodbye.embed_color || '#5865F2')};">
          <div class="p-2.5 space-y-1">
            <p class="text-xs text-amber-400/90 italic">Empty embed. Start typing to customize...</p>
          </div>
        </div>
      `;
      return;
    }

    const authorHtml = rawAuthor ? renderPreviewTokens(rawAuthor) : '';
    const titleHtml = rawTitle ? renderPreviewTokens(rawTitle) : '';
    const descHtml = rawDesc ? renderPreviewTokens(rawDesc) : '';
    const footerHtml = rawFooter ? renderPreviewTokens(rawFooter) : '';

    bodyEl.innerHTML = `
      <div class="border-l-[3px] rounded-r bg-[#2b2d31] max-w-full sm:max-w-[420px]" style="border-color: ${esc(state.goodbye.embed_color || '#5865F2')};">
        <div class="p-2.5 flex flex-col gap-2">
          ${authorHtml ? `
            <div class="text-[11px] font-semibold text-white break-words">${authorHtml}</div>
          ` : ''}
          <div class="flex-1 min-w-0 space-y-1">
            ${titleHtml ? `<p class="text-xs font-semibold text-white leading-snug break-words">${titleHtml}</p>` : ''}
            ${descHtml ? `<p class="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap break-words">${descHtml}</p>` : ''}
          </div>
          ${state.goodbye.embed_image ? `
            <img src="${esc(state.goodbye.embed_image)}" alt="Goodbye embed preview" class="w-full max-h-48 object-cover rounded-lg border border-neutral-800/60 mt-0.5">
          ` : ''}
          ${footerHtml ? `
            <div class="pt-0.5 text-[10px] text-neutral-400 break-words">${footerHtml}</div>
          ` : ''}
        </div>
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

  function insertAtCursor(inputEl, textToInsert) {
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

  function autoResizeOverlayTextarea(input, overlay, minHeight = 42) {
    if (!input) return;
    input.style.height = 'auto';
    const targetH = Math.max(minHeight, input.scrollHeight);
    input.style.height = `${targetH}px`;
    if (overlay) {
      overlay.style.height = `${targetH}px`;
      overlay.scrollTop = input.scrollTop;
      overlay.scrollLeft = input.scrollLeft;
    }
    const parent = input.parentElement;
    if (parent) {
      parent.style.minHeight = `${targetH}px`;
    }
  }

  function refreshAllAutoResizes() {
    [
      { id: 'w-author-input', ov: 'w-author-overlay', min: 42 },
      { id: 'w-title-input', ov: 'w-title-overlay', min: 42 },
      { id: 'w-desc-input', ov: 'w-desc-overlay', min: 84 },
      { id: 'w-footer-input', ov: 'w-footer-overlay', min: 42 },
      { id: 'w-dm-input', ov: 'w-dm-overlay', min: 104 },
      { id: 'g-author-input', ov: 'g-author-overlay', min: 42 },
      { id: 'g-title-input', ov: 'g-title-overlay', min: 42 },
      { id: 'g-desc-input', ov: 'g-desc-overlay', min: 84 },
      { id: 'g-footer-input', ov: 'g-footer-overlay', min: 42 },
      { id: 'g-dm-input', ov: 'g-dm-overlay', min: 84 }
    ].forEach(({ id, ov, min }) => {
      const input = document.getElementById(id);
      const overlay = document.getElementById(ov);
      if (input && overlay && input.offsetParent !== null) {
        autoResizeOverlayTextarea(input, overlay, min);
      }
    });
  }

  window.addEventListener('resize', refreshAllAutoResizes);

  function bindOverlayTextarea(inputId, overlayId, placeholder, onUpdate, minHeight = 42) {
    const input = document.getElementById(inputId);
    const overlay = document.getElementById(overlayId);
    if (!input || !overlay) return;

    const sync = () => {
      overlay.innerHTML = highlightVariablesOverlay(input.value, placeholder);
      autoResizeOverlayTextarea(input, overlay, minHeight);
      onUpdate(input.value);
    };

    input.addEventListener('input', sync);
    input.addEventListener('scroll', () => {
      overlay.scrollTop = input.scrollTop;
      overlay.scrollLeft = input.scrollLeft;
    });

    autoResizeOverlayTextarea(input, overlay, minHeight);
    overlay.innerHTML = highlightVariablesOverlay(input.value, placeholder);
  }

  function bindImageUpload(dropzoneId, fileInputId, urlBtnId, removeBtnId, onSetUrl) {
    const dropzone = document.getElementById(dropzoneId);
    const fileInput = document.getElementById(fileInputId);
    const urlBtn = document.getElementById(urlBtnId);
    const removeBtn = document.getElementById(removeBtnId);

    if (removeBtn) {
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        onSetUrl('');
      };
    }

    if (urlBtn) {
      urlBtn.onclick = (e) => {
        e.stopPropagation();
        if (window.Modal && Modal.open) {
          Modal.open({
            title: 'Embed Image URL',
            content: `
              <div class="flex flex-col gap-2">
                <label class="text-xs font-medium text-neutral-300">Direct Image URL (PNG, JPG, WebP, GIF)</label>
                <input type="url" id="welcome-img-url-modal-input" placeholder="https://example.com/banner.png" class="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-600">
              </div>
            `,
            confirmText: 'Save Image',
            onConfirm: () => {
              const val = document.getElementById('welcome-img-url-modal-input')?.value?.trim();
              if (val) onSetUrl(val);
            }
          });
        } else {
          const val = window.prompt('Enter direct image URL (https://...):');
          if (val && val.trim()) onSetUrl(val.trim());
        }
      };
    }

    const handleFile = async (file) => {
      if (!file) return;
      if (file.size > 4 * 1024 * 1024) {
        if (window.Toast) Toast.error('Image exceeds 4 MB limit.');
        return;
      }
      try {
        const res = await API.uploadImage(file);
        const uploadedUrl = res?.url || res?.path;
        if (uploadedUrl) {
          onSetUrl(uploadedUrl);
          if (window.Toast) Toast.success('Image uploaded!');
        }
      } catch (err) {
        if (window.Toast) Toast.error('Failed to upload image: ' + err.message);
      }
    };

    if (dropzone && fileInput) {
      dropzone.onclick = (e) => {
        if (e.target.closest('button')) return;
        fileInput.click();
      };
      fileInput.onchange = () => {
        if (fileInput.files?.[0]) handleFile(fileInput.files[0]);
      };
      dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.classList.add('border-indigo-500');
      };
      dropzone.ondragleave = () => {
        dropzone.classList.remove('border-indigo-500');
      };
      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-indigo-500');
        if (e.dataTransfer?.files?.[0]) handleFile(e.dataTransfer.files[0]);
      };
    }
  }

  function bindEvents() {
    function updateWelcomeCharCount() {
      const cnt = document.getElementById('w-char-count');
      if (!cnt) return;
      const total = (state.welcome.embed_author || '').length +
        (state.welcome.embed_title || '').length +
        (state.welcome.embed_description || '').length +
        (state.welcome.embed_footer || '').length;
      cnt.textContent = `${total}/2000`;
      cnt.classList.toggle('text-red-400', total > 2000);
      cnt.classList.toggle('text-neutral-600', total <= 2000);
    }

    function updateGoodbyeCharCount() {
      const cnt = document.getElementById('g-char-count');
      if (!cnt) return;
      const total = (state.goodbye.embed_author || '').length +
        (state.goodbye.embed_title || '').length +
        (state.goodbye.embed_description || '').length +
        (state.goodbye.embed_footer || '').length;
      cnt.textContent = `${total}/2000`;
      cnt.classList.toggle('text-red-400', total > 2000);
      cnt.classList.toggle('text-neutral-600', total <= 2000);
    }

    // Track last focused input for variable chip insertion
    const wAuthor = document.getElementById('w-author-input');
    const wTitle = document.getElementById('w-title-input');
    const wDesc = document.getElementById('w-desc-input');
    const wFooter = document.getElementById('w-footer-input');
    const gAuthor = document.getElementById('g-author-input');
    const gTitle = document.getElementById('g-title-input');
    const gDesc = document.getElementById('g-desc-input');
    const gFooter = document.getElementById('g-footer-input');

    if (wAuthor) wAuthor.addEventListener('focus', () => { lastFocusedWelcomeInput = 'w-author'; });
    if (wTitle) wTitle.addEventListener('focus', () => { lastFocusedWelcomeInput = 'w-title'; });
    if (wDesc) wDesc.addEventListener('focus', () => { lastFocusedWelcomeInput = 'w-desc'; });
    if (wFooter) wFooter.addEventListener('focus', () => { lastFocusedWelcomeInput = 'w-footer'; });

    if (gAuthor) gAuthor.addEventListener('focus', () => { lastFocusedGoodbyeInput = 'g-author'; });
    if (gTitle) gTitle.addEventListener('focus', () => { lastFocusedGoodbyeInput = 'g-title'; });
    if (gDesc) gDesc.addEventListener('focus', () => { lastFocusedGoodbyeInput = 'g-desc'; });
    if (gFooter) gFooter.addEventListener('focus', () => { lastFocusedGoodbyeInput = 'g-footer'; });

    // Bind syntax-highlighted textareas with dynamic auto-height
    bindOverlayTextarea('w-author-input', 'w-author-overlay', '• Welcome to My Server!  (Author / Header)', (val) => {
      state.welcome.embed_author = val;
      updateWelcomeCharCount();
      updateWelcomePreview();
      scheduleSave();
    }, 42);

    bindOverlayTextarea('w-title-input', 'w-title-overlay', '***{user} Explore the server.***  (Title)', (val) => {
      state.welcome.embed_title = val;
      updateWelcomeCharCount();
      updateWelcomePreview();
      scheduleSave();
    }, 42);

    bindOverlayTextarea('w-desc-input', 'w-desc-overlay', 'Welcome {user} to {server}!  (Description)', (val) => {
      state.welcome.embed_description = val;
      updateWelcomeCharCount();
      updateWelcomePreview();
      scheduleSave();
    }, 84);

    bindOverlayTextarea('w-footer-input', 'w-footer-overlay', 'Footer text (optional)', (val) => {
      state.welcome.embed_footer = val;
      updateWelcomeCharCount();
      updateWelcomePreview();
      scheduleSave();
    }, 42);

    bindOverlayTextarea('w-dm-input', 'w-dm-overlay', '👋 Welcome to {server} (default)', (val) => {
      state.welcome.dm_message = val;
      const cnt = document.getElementById('w-dm-char-count');
      if (cnt) cnt.textContent = `${val.length}/2000`;
      scheduleSave();
    }, 104);

    bindOverlayTextarea('g-author-input', 'g-author-overlay', '• Goodbye! (Author / Header)', (val) => {
      state.goodbye.embed_author = val;
      updateGoodbyeCharCount();
      updateGoodbyePreview();
      scheduleSave();
    }, 42);

    bindOverlayTextarea('g-title-input', 'g-title-overlay', '***{user} left the server.*** (Title)', (val) => {
      state.goodbye.embed_title = val;
      updateGoodbyeCharCount();
      updateGoodbyePreview();
      scheduleSave();
    }, 42);

    bindOverlayTextarea('g-desc-input', 'g-desc-overlay', 'Goodbye {user}! (Description)', (val) => {
      state.goodbye.embed_description = val;
      updateGoodbyeCharCount();
      updateGoodbyePreview();
      scheduleSave();
    }, 84);

    bindOverlayTextarea('g-footer-input', 'g-footer-overlay', 'Footer text (optional)', (val) => {
      state.goodbye.embed_footer = val;
      updateGoodbyeCharCount();
      updateGoodbyePreview();
      scheduleSave();
    }, 42);

    bindOverlayTextarea('g-dm-input', 'g-dm-overlay', '👋 You left {server} (default)', (val) => {
      state.goodbye.dm_message = val;
      const cnt = document.getElementById('g-dm-char-count');
      if (cnt) cnt.textContent = `${val.length}/2000`;
      scheduleSave();
    }, 84);

    // Variable chips
    document.querySelectorAll('.w-var-chip').forEach(btn => {
      btn.onclick = () => {
        const token = btn.getAttribute('data-var');
        let target = document.getElementById('w-desc-input');
        if (state.welcome.embed) {
          if (lastFocusedWelcomeInput === 'w-author') target = document.getElementById('w-author-input');
          else if (lastFocusedWelcomeInput === 'w-title') target = document.getElementById('w-title-input');
          else if (lastFocusedWelcomeInput === 'w-footer') target = document.getElementById('w-footer-input');
        }
        insertAtCursor(target, token);
      };
    });

    document.querySelectorAll('.w-dm-chip').forEach(btn => {
      btn.onclick = () => {
        insertAtCursor(document.getElementById('w-dm-input'), btn.getAttribute('data-var'));
      };
    });

    document.querySelectorAll('.g-var-chip').forEach(btn => {
      btn.onclick = () => {
        const token = btn.getAttribute('data-var');
        let target = document.getElementById('g-desc-input');
        if (state.goodbye.embed) {
          if (lastFocusedGoodbyeInput === 'g-author') target = document.getElementById('g-author-input');
          else if (lastFocusedGoodbyeInput === 'g-title') target = document.getElementById('g-title-input');
          else if (lastFocusedGoodbyeInput === 'g-footer') target = document.getElementById('g-footer-input');
        }
        insertAtCursor(target, token);
      };
    });

    document.querySelectorAll('.g-dm-chip').forEach(btn => {
      btn.onclick = () => {
        insertAtCursor(document.getElementById('g-dm-input'), btn.getAttribute('data-var'));
      };
    });

    // Channel dropdowns
    const wChBtn = document.getElementById('w-channel-btn');
    const wChMenu = document.getElementById('w-channel-menu');
    if (wChBtn && wChMenu) {
      wChBtn.onclick = (e) => {
        e.stopPropagation();
        wChMenu.classList.toggle('hidden');
        document.getElementById('g-channel-menu')?.classList.add('hidden');
        if (!wChMenu.classList.contains('hidden') && window.OrbitDropdownManager) {
          window.OrbitDropdownManager.scheduleSync();
        }
      };
      document.querySelectorAll('.w-ch-opt').forEach(opt => {
        opt.onclick = () => {
          state.welcome.channel_id = opt.getAttribute('data-ch') || '';
          wChMenu.classList.add('hidden');
          const lbl = document.getElementById('w-channel-label');
          if (lbl) {
            lbl.textContent = getChannelLabel(state.welcome.channel_id);
            lbl.className = `min-w-0 truncate text-sm ${state.welcome.channel_id ? 'text-white font-medium' : 'text-neutral-500'}`;
          }
          const prevCh = document.getElementById('w-preview-channel-name');
          if (prevCh) prevCh.textContent = getChannelPureName(state.welcome.channel_id, 'welcome');
          const testBtn = document.getElementById('w-send-test-btn');
          if (testBtn) testBtn.disabled = !state.welcome.channel_id;
          scheduleSave();
        };
      });
    }

    const gChBtn = document.getElementById('g-channel-btn');
    const gChMenu = document.getElementById('g-channel-menu');
    if (gChBtn && gChMenu) {
      gChBtn.onclick = (e) => {
        e.stopPropagation();
        gChMenu.classList.toggle('hidden');
        document.getElementById('w-channel-menu')?.classList.add('hidden');
        if (!gChMenu.classList.contains('hidden') && window.OrbitDropdownManager) {
          window.OrbitDropdownManager.scheduleSync();
        }
      };
      document.querySelectorAll('.g-ch-opt').forEach(opt => {
        opt.onclick = () => {
          state.goodbye.channel_id = opt.getAttribute('data-ch') || '';
          gChMenu.classList.add('hidden');
          const lbl = document.getElementById('g-channel-label');
          if (lbl) {
            lbl.textContent = getChannelLabel(state.goodbye.channel_id);
            lbl.className = `min-w-0 truncate text-sm ${state.goodbye.channel_id ? 'text-white font-medium' : 'text-neutral-500'}`;
          }
          const prevCh = document.getElementById('g-preview-channel-name');
          if (prevCh) prevCh.textContent = getChannelPureName(state.goodbye.channel_id, 'goodbye');
          const testBtn = document.getElementById('g-send-test-btn');
          if (testBtn) testBtn.disabled = !state.goodbye.channel_id;
          scheduleSave();
        };
      });
    }

    // Switches
    const bindSwitch = (id, getter, setter) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.onclick = () => {
        const next = !getter();
        setter(next);
        setSwitchVisual(id, next);
        scheduleSave();
      };
    };

    bindSwitch('w-enabled-switch', () => state.welcome.enabled, (v) => {
      state.welcome.enabled = v;
      const wrap = document.getElementById('w-preview-bot-wrap');
      if (wrap) {
        wrap.classList.toggle('opacity-100', v);
        wrap.classList.toggle('opacity-40', !v);
      }
    });

    bindSwitch('w-embed-switch', () => state.welcome.embed, (v) => {
      state.welcome.embed = v;
      const authorRow = document.getElementById('w-author-row');
      if (authorRow) {
        authorRow.classList.toggle('flex', v);
        authorRow.classList.toggle('hidden', !v);
      }
      const titleRow = document.getElementById('w-title-row');
      if (titleRow) {
        titleRow.classList.toggle('block', v);
        titleRow.classList.toggle('hidden', !v);
      }
      const footerRow = document.getElementById('w-footer-row');
      if (footerRow) {
        footerRow.classList.toggle('block', v);
        footerRow.classList.toggle('hidden', !v);
      }
      setTimeout(refreshAllAutoResizes, 10);
      updateWelcomePreview();
    });

    bindSwitch('w-avatar-switch', () => state.welcome.show_avatar, (v) => {
      state.welcome.show_avatar = v;
      updateWelcomePreview();
    });

    bindSwitch('w-invitevars-switch', () => state.welcome.invite_vars, (v) => {
      state.welcome.invite_vars = v;
      const extra = document.getElementById('w-extra-invite-chips');
      if (extra) {
        extra.classList.toggle('inline-flex', v);
        extra.classList.toggle('hidden', !v);
      }
    });

    bindSwitch('w-dm-switch', () => state.welcome.dm_enabled, (v) => {
      state.welcome.dm_enabled = v;
    });

    bindSwitch('g-enabled-switch', () => state.goodbye.enabled, (v) => {
      state.goodbye.enabled = v;
      const wrap = document.getElementById('g-preview-bot-wrap');
      if (wrap) {
        wrap.classList.toggle('opacity-100', v);
        wrap.classList.toggle('opacity-40', !v);
      }
    });

    bindSwitch('g-embed-switch', () => state.goodbye.embed, (v) => {
      state.goodbye.embed = v;
      const authorRow = document.getElementById('g-author-row');
      if (authorRow) {
        authorRow.classList.toggle('flex', v);
        authorRow.classList.toggle('hidden', !v);
      }
      const titleRow = document.getElementById('g-title-row');
      if (titleRow) {
        titleRow.classList.toggle('block', v);
        titleRow.classList.toggle('hidden', !v);
      }
      const footerRow = document.getElementById('g-footer-row');
      if (footerRow) {
        footerRow.classList.toggle('block', v);
        footerRow.classList.toggle('hidden', !v);
      }
      setTimeout(refreshAllAutoResizes, 10);
      updateGoodbyePreview();
    });

    bindSwitch('g-dm-switch', () => state.goodbye.dm_enabled, (v) => {
      state.goodbye.dm_enabled = v;
    });

    // Color pickers
    const setupColorPicker = (btnId, popId, presetClass, nativeId, hexId, onColor) => {
      const btn = document.getElementById(btnId);
      const pop = document.getElementById(popId);
      const native = document.getElementById(nativeId);
      const hex = document.getElementById(hexId);
      if (!btn || !pop) return;

      btn.onclick = (e) => {
        e.stopPropagation();
        pop.classList.toggle('hidden');
      };
      pop.onclick = (e) => e.stopPropagation();

      const applyColor = (c) => {
        btn.style.backgroundColor = c;
        if (native) native.value = c;
        if (hex) hex.value = c;
        onColor(c);
        scheduleSave();
      };

      document.querySelectorAll(`.${presetClass}`).forEach(p => {
        p.onclick = () => applyColor(p.getAttribute('data-color'));
      });
      if (native) {
        native.oninput = () => applyColor(native.value);
      }
      if (hex) {
        hex.oninput = () => {
          if (/^#[0-9A-Fa-f]{6}$/.test(hex.value.trim())) {
            applyColor(hex.value.trim());
          }
        };
      }
    };

    setupColorPicker('w-color-btn', 'w-color-popover', 'w-color-preset', 'w-color-native', 'w-color-hex', (c) => {
      state.welcome.embed_color = c;
      updateWelcomePreview();
    });

    setupColorPicker('g-color-btn', 'g-color-popover', 'g-color-preset', 'g-color-native', 'g-color-hex', (c) => {
      state.goodbye.embed_color = c;
      updateGoodbyePreview();
    });

    // Image upload / URL
    bindImageUpload('w-img-dropzone', 'w-img-file', 'w-img-url-btn', 'w-img-remove-btn', (url) => {
      state.welcome.embed_image = url;
      renderPage();
      scheduleSave();
    });

    bindImageUpload('g-img-dropzone', 'g-img-file', 'g-img-url-btn', 'g-img-remove-btn', (url) => {
      state.goodbye.embed_image = url;
      renderPage();
      scheduleSave();
    });

    // Emoji Popover
    const emojiPop = document.getElementById('welcome-emoji-popover');
    let activeEmojiTargetId = null;

    document.querySelectorAll('.emoji-trigger-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const targetId = btn.getAttribute('data-emoji-target');
        if (!emojiPop) return;
        if (!emojiPop.classList.contains('hidden') && activeEmojiTargetId === targetId) {
          emojiPop.classList.add('hidden');
          return;
        }
        activeEmojiTargetId = targetId;
        const rect = btn.getBoundingClientRect();
        emojiPop.style.top = `${Math.min(window.innerHeight - 190, rect.bottom + 6)}px`;
        emojiPop.style.left = `${Math.max(12, rect.right - 240)}px`;
        emojiPop.classList.remove('hidden');
      };
    });

    document.querySelectorAll('.welcome-emoji-item').forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        const em = item.getAttribute('data-emoji');
        if (activeEmojiTargetId && em) {
          insertAtCursor(document.getElementById(activeEmojiTargetId), em);
        }
        emojiPop?.classList.add('hidden');
      };
    });

    // Close popovers on outside click
    document.addEventListener('click', () => {
      document.getElementById('w-channel-menu')?.classList.add('hidden');
      document.getElementById('g-channel-menu')?.classList.add('hidden');
      document.getElementById('w-color-popover')?.classList.add('hidden');
      document.getElementById('g-color-popover')?.classList.add('hidden');
      document.getElementById('welcome-emoji-popover')?.classList.add('hidden');
    });

    // Send Test Welcome
    const wTestBtn = document.getElementById('w-send-test-btn');
    if (wTestBtn) {
      wTestBtn.onclick = async () => {
        if (!state.welcome.channel_id) return;
        const orig = wTestBtn.innerHTML;
        wTestBtn.disabled = true;
        wTestBtn.textContent = 'Sending...';
        try {
          await saveNow();
          await API.testWelcome(guildId, {
            type: 'welcome',
            channel_id: state.welcome.channel_id
          });
          if (window.Toast) Toast.success('Test welcome message sent to Discord!');
        } catch (err) {
          if (window.Toast) Toast.error('Failed to send test welcome: ' + err.message);
        } finally {
          wTestBtn.disabled = !state.welcome.channel_id;
          wTestBtn.innerHTML = orig;
        }
      };
    }

    // Send Test Goodbye
    const gTestBtn = document.getElementById('g-send-test-btn');
    if (gTestBtn) {
      gTestBtn.onclick = async () => {
        if (!state.goodbye.channel_id) return;
        const orig = gTestBtn.innerHTML;
        gTestBtn.disabled = true;
        gTestBtn.textContent = 'Sending...';
        try {
          await saveNow();
          await API.testWelcome(guildId, {
            type: 'goodbye',
            channel_id: state.goodbye.channel_id
          });
          if (window.Toast) Toast.success('Test goodbye message sent to Discord!');
        } catch (err) {
          if (window.Toast) Toast.error('Failed to send test goodbye: ' + err.message);
        } finally {
          gTestBtn.disabled = !state.goodbye.channel_id;
          gTestBtn.innerHTML = orig;
        }
      };
    }

    // Test DM (Welcome)
    const wTestDmBtn = document.getElementById('w-test-dm-btn');
    if (wTestDmBtn) {
      wTestDmBtn.onclick = async () => {
        const orig = wTestDmBtn.innerHTML;
        wTestDmBtn.disabled = true;
        wTestDmBtn.textContent = 'Sending...';
        try {
          await saveNow();
          await API.testDm(guildId, {
            type: 'welcome',
            dm_message: state.welcome.dm_message
          });
          if (window.Toast) Toast.success('Test Welcome DM sent to your Discord!');
        } catch (err) {
          if (window.Toast) Toast.error('Failed to send Test DM: ' + err.message);
        } finally {
          wTestDmBtn.disabled = false;
          wTestDmBtn.innerHTML = orig;
        }
      };
    }

    // Test DM (Goodbye)
    const gTestDmBtn = document.getElementById('g-test-dm-btn');
    if (gTestDmBtn) {
      gTestDmBtn.onclick = async () => {
        const orig = gTestDmBtn.innerHTML;
        gTestDmBtn.disabled = true;
        gTestDmBtn.textContent = 'Sending...';
        try {
          await saveNow();
          await API.testDm(guildId, {
            type: 'goodbye',
            dm_message: state.goodbye.dm_message
          });
          if (window.Toast) Toast.success('Test Leave DM sent to your Discord!');
        } catch (err) {
          if (window.Toast) Toast.error('Failed to send Test DM: ' + err.message);
        } finally {
          gTestDmBtn.disabled = false;
          gTestDmBtn.innerHTML = orig;
        }
      };
    }
  }

  // Initial render with loading state
  renderPage();

  try {
    const [configData, chData, guildsData] = await Promise.all([
      API.getConfig(guildId).catch((err) => {
        console.warn('[Welcome] API.getConfig failed:', err);
        return {};
      }),
      API.getChannels(guildId).catch(() => ([])),
      API.getGuilds().catch(() => ([]))
    ]);

    const guildsList = Array.isArray(guildsData) ? guildsData : (guildsData?.guilds || []);
    const gObj = guildsList.find(g => String(g.id) === String(guildId));
    if (gObj) {
      state.guildName = gObj.name || 'My Server';
      if (gObj.member_count) state.memberCount = gObj.member_count;
    }

    const cfg = configData.config || configData || {};
    const rawChs = (Array.isArray(chData) && chData.length > 0)
      ? chData
      : (Array.isArray(configData.channels) ? configData.channels : []);
    state.allChannels = rawChs;
    state.emojis = Array.isArray(configData.emojis) ? configData.emojis : (Array.isArray(cfg.emojis) ? cfg.emojis : []);
    state.roles = Array.isArray(configData.roles) ? configData.roles : (Array.isArray(cfg.roles) ? cfg.roles : []);
    state.members = Array.isArray(configData.members) ? configData.members : (Array.isArray(cfg.members) ? cfg.members : []);
    state.channels = rawChs.filter(c => !c.type || c.type === 'text' || c.type === 'news' || c.type === 0 || c.type === 5 || (typeof c.type === 'string' && c.type.includes('text')));

    if (cfg.botprofile) {
      state.botName = cfg.botprofile.nickname || cfg.botprofile.default_name || 'Orbit';
      state.botAvatar = cfg.botprofile.avatar_url || cfg.botprofile.default_avatar || '/img/logo.png';
    }

    if (cfg.welcome) {
      const w = cfg.welcome;
      const defaultWMsg = 'Welcome {user} to **{server}**! We are happy to have you as member #{count}.';
      let desc = '';
      if (w.embed_description !== undefined && w.embed_description !== null && w.embed_description !== '') {
        desc = w.embed_description;
      } else if (w.message && w.message !== defaultWMsg) {
        desc = w.message;
      } else if (w.message) {
        desc = w.message;
      }
      state.welcome = {
        enabled: Boolean(w.enabled),
        channel_id: w.channel_id ? String(w.channel_id) : '',
        embed: w.msg_mode ? (w.msg_mode !== 'text') : true,
        show_avatar: w.show_avatar !== undefined ? Boolean(w.show_avatar) : true,
        invite_vars: Boolean(w.invite_vars),
        embed_color: w.embed_color || '#5865F2',
        embed_author: w.embed_author || '',
        embed_title: w.embed_title || '',
        embed_description: desc,
        embed_footer: w.embed_footer || '',
        embed_image: w.embed_image || w.image_url || '',
        dm_enabled: Boolean(w.dm_enabled),
        dm_message: w.dm_message || ''
      };
    }

    if (cfg.goodbye) {
      const g = cfg.goodbye;
      const defaultGMsg = "We're sad to see you go, {user}! We hope you enjoyed your time in **{server}**.";
      let desc = '';
      if (g.embed_description !== undefined && g.embed_description !== null && g.embed_description !== '') {
        desc = g.embed_description;
      } else if (g.message && g.message !== defaultGMsg) {
        desc = g.message;
      } else if (g.message) {
        desc = g.message;
      }
      state.goodbye = {
        enabled: Boolean(g.enabled),
        channel_id: g.channel_id ? String(g.channel_id) : '',
        embed: g.msg_mode ? (g.msg_mode !== 'text') : true,
        embed_color: g.embed_color || '#5865F2',
        embed_author: g.embed_author || '',
        embed_title: g.embed_title || '',
        embed_description: desc,
        embed_footer: g.embed_footer || '',
        embed_image: g.embed_image || g.image_url || '',
        dm_enabled: Boolean(g.dm_enabled),
        dm_message: g.dm_message || ''
      };
    }
  } catch (err) {
    console.warn('[Welcome] Failed to load config:', err);
  } finally {
    isInitialLoading = false;
    renderPage();
  }
};

window.renderWelcomeGoodbyeModule = function (el, guildId) {
  return DashboardTabs.Welcome(el, guildId);
};
