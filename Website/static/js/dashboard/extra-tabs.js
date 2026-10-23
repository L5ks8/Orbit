/**
 * Orbit Dashboard - Extra Tabs
 * Roles, Bot Profile, Invites, Security, Settings, Analytics, Leaderboard.
 */

DashboardTabs.Roles = async function(container, guildId) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">Server Roles</h1>
          <p class="text-xs text-neutral-400 mt-1">Overview of role hierarchy and membership in this server.</p>
        </div>
      </div>
      <div id="roles-list-content" class="flex flex-col gap-3">
        <div class="text-center py-12 text-neutral-500 text-sm">Loading roles...</div>
      </div>
    </div>
  `;

  try {
    const roles = await API.getRoles(guildId);
    const content = document.getElementById('roles-list-content');
    if (!content) return;

    content.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        ${roles.map(r => `
          <div class="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 truncate">
              <span class="w-3 h-3 rounded-full shrink-0" style="background-color: ${r.color || '#99aab5'}"></span>
              <span class="text-xs font-semibold text-white truncate">@${r.name}</span>
            </div>
            <span class="text-[10px] text-neutral-500 font-mono shrink-0">${r.id}</span>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="p-8 text-red-400 text-center">Error: ${err.message}</div>`;
  }
};

DashboardTabs.BotProfile = async function(container, guildId) {
  const state = {
    nickname: '',
    avatar_url: '',
    banner_url: '',
    bio: '',
    default_name: 'Orbit',
    default_avatar: '/img/logo.png'
  };

  let saveTimer = null;

  container.innerHTML = `
    <div>
      <div data-tour="feature-header" class="scroll-mt-24">
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot w-5 h-5"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
            </span>
            <h1 class="text-base font-medium text-white truncate">Bot Profile</h1>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <div class="flex items-center gap-3">
              <span id="bp-save-status" class="text-xs text-neutral-600 transition-colors">Auto-saved</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <div class="space-y-4">
          <!-- Live Discord Profile Preview Card -->
          <div class="rounded-2xl overflow-hidden border border-neutral-800 bg-[#1e1f22] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div class="relative h-[120px] w-full">
              <div id="bp-preview-banner-gradient" class="absolute inset-0 bg-gradient-to-br from-violet-600/40 via-indigo-600/30 to-blue-600/40"></div>
              <img id="bp-preview-banner-img" src="" alt="" class="hidden absolute inset-0 w-full h-full object-cover">
              <div class="absolute top-2.5 right-2.5 flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-horizontal w-4 h-4 text-white"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                </div>
              </div>
            </div>
            <div class="px-5 pb-4 -mt-9 flex items-end gap-3">
              <div class="relative w-[72px] h-[72px] flex-shrink-0">
                <div class="w-full h-full rounded-full overflow-hidden ring-[5px] ring-[#1e1f22] bg-neutral-900">
                  <img id="bp-preview-avatar-img" src="/img/logo.png" alt="" class="w-full h-full object-cover opacity-90">
                </div>
                <div class="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-[2.5px] ring-[#1e1f22]"></div>
              </div>
              <div class="min-w-0 pb-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span id="bp-preview-name" class="text-[18px] font-bold text-white truncate max-w-full leading-tight">Orbit</span>
                  <span class="inline-flex items-center gap-0.5 pl-1 pr-1.5 py-0.5 rounded bg-[#5865F2] text-white text-[10px] font-bold uppercase tracking-wide">
                    <svg viewBox="0 0 16 16" class="w-3 h-3"><path d="M5 8.5l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg>App
                  </span>
                </div>
              </div>
            </div>
            <div id="bp-preview-bio-wrap" class="hidden px-5 pb-4">
              <p id="bp-preview-bio" class="text-[13px] text-neutral-300 whitespace-pre-wrap break-words leading-relaxed"></p>
            </div>
          </div>

          <!-- Two-Column Grid: Identity & Banner -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            <!-- Identity Card -->
            <div class="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col h-full">
              <div class="px-5 py-3 border-b border-neutral-800">
                <h3 class="text-[13px] font-semibold text-white">Identity</h3>
              </div>
              <div class="p-5 flex-1 flex flex-col">
                <div class="flex flex-col h-full gap-4">
                  <div>
                    <label class="block text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-1.5">Nickname</label>
                    <div class="relative">
                      <input id="bp-nickname-input" placeholder="Orbit" maxlength="32" class="w-full bg-neutral-950 border rounded-xl px-3.5 py-2.5 pr-14 text-[14px] text-white placeholder:text-neutral-600 outline-none transition-colors border-neutral-800 hover:border-neutral-700 focus:border-neutral-600" type="text" value="">
                      <span id="bp-nickname-counter" class="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] tabular-nums text-neutral-600">0/32</span>
                    </div>
                  </div>
                  <div class="border-t border-neutral-800/60 pt-4 flex-1 flex flex-col">
                    <label class="block text-[11px] font-semibold text-neutral-400 uppercase tracking-[0.08em] mb-1.5">Avatar</label>
                    <div class="flex flex-col h-full">
                      <div class="flex items-center gap-4">
                        <div id="bp-avatar-dropzone" class="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 group cursor-pointer transition-[border-color,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 border-[1.5px] border-dashed bg-neutral-950 border-neutral-700 hover:border-neutral-600" role="button" tabindex="0" title="Click to upload">
                          <img id="bp-avatar-thumb" src="" alt="" class="hidden w-full h-full object-cover">
                          <div id="bp-avatar-placeholder" class="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-plus w-5 h-5 text-neutral-500"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path><line x1="16" x2="22" y1="5" y2="5"></line><line x1="19" x2="19" y1="2" y2="8"></line><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                          </div>
                        </div>
                        <div class="flex flex-col gap-2 min-w-0">
                          <button type="button" id="bp-avatar-upload-btn" class="inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/60 hover:text-white cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
                            <span>Upload</span>
                          </button>
                          <button type="button" id="bp-avatar-url-btn" class="inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/60 hover:text-white cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link2 w-3.5 h-3.5"><path d="M9 17H7A5 5 0 0 1 7 7h2"></path><path d="M15 7h2a5 5 0 1 1 0 10h-2"></path><line x1="8" x2="16" y1="12" y2="12"></line></svg>
                            <span>URL</span>
                          </button>
                          <button type="button" id="bp-avatar-remove-btn" class="hidden inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none border-red-500/20 text-red-400 hover:bg-red-500/10 cursor-pointer">
                            <span>Reset</span>
                          </button>
                        </div>
                      </div>
                      <div id="bp-avatar-url-drawer" class="hidden mt-3 flex items-center gap-2">
                        <input id="bp-avatar-url-input" type="url" placeholder="https://example.com/avatar.png" class="flex-1 min-w-0 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 focus:border-neutral-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 outline-none transition-colors">
                        <button type="button" id="bp-avatar-url-apply" class="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer">Apply</button>
                      </div>
                      <input id="bp-avatar-file-input" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" type="file">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Banner Card -->
            <div class="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col h-full">
              <div class="px-5 py-3 border-b border-neutral-800">
                <h3 class="text-[13px] font-semibold text-white">Banner</h3>
              </div>
              <div class="p-5 flex-1 flex flex-col">
                <div class="flex flex-col h-full">
                  <div id="bp-banner-dropzone" class="relative w-full aspect-[16/7] max-h-[150px] rounded-xl overflow-hidden flex items-center justify-center cursor-pointer group transition-[border-color,background-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 border-[1.5px] border-dashed bg-neutral-950 border-neutral-700 hover:border-neutral-600" role="button" tabindex="0" title="Click to upload">
                    <img id="bp-banner-thumb" src="" alt="" class="hidden absolute inset-0 w-full h-full object-cover">
                    <div id="bp-banner-placeholder" class="flex flex-col items-center text-neutral-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image-plus w-6 h-6 mb-1"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path><line x1="16" x2="22" y1="5" y2="5"></line><line x1="19" x2="19" y1="2" y2="8"></line><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
                      <span class="text-xs font-medium text-neutral-400">Drop or click to upload</span>
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-2 mt-3">
                    <button type="button" id="bp-banner-upload-btn" class="inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/60 hover:text-white cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
                      <span>Upload</span>
                    </button>
                    <button type="button" id="bp-banner-url-btn" class="inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/60 hover:text-white cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link2 w-3.5 h-3.5"><path d="M9 17H7A5 5 0 0 1 7 7h2"></path><path d="M15 7h2a5 5 0 1 1 0 10h-2"></path><line x1="8" x2="16" y1="12" y2="12"></line></svg>
                      <span>URL</span>
                    </button>
                    <button type="button" id="bp-banner-remove-btn" class="hidden inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none border-red-500/20 text-red-400 hover:bg-red-500/10 cursor-pointer">
                      <span>Reset</span>
                    </button>
                  </div>
                  <div id="bp-banner-url-drawer" class="hidden mt-3 flex items-center gap-2">
                    <input id="bp-banner-url-input" type="url" placeholder="https://example.com/banner.png" class="flex-1 min-w-0 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 focus:border-neutral-600 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 outline-none transition-colors">
                    <button type="button" id="bp-banner-url-apply" class="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors cursor-pointer">Apply</button>
                  </div>
                  <input id="bp-banner-file-input" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" type="file">
                </div>
              </div>
            </div>
          </div>

          <!-- Bio Card -->
          <div class="rounded-2xl border border-neutral-800 bg-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col h-full">
            <div class="px-5 py-3 border-b border-neutral-800">
              <h3 class="text-[13px] font-semibold text-white">Bio</h3>
            </div>
            <div class="p-5 flex-1 flex flex-col">
              <div class="flex flex-col gap-2">
                <div class="relative">
                  <textarea id="bp-bio-input" placeholder="A few words about what your server does or what people should ask the bot." maxlength="190" rows="3" class="w-full min-h-[86px] bg-neutral-950 border rounded-xl px-3.5 py-2.5 pr-14 text-[14px] text-white placeholder:text-neutral-600 outline-none transition-colors resize-y border-neutral-800 hover:border-neutral-700 focus:border-neutral-600"></textarea>
                  <span id="bp-bio-counter" class="absolute right-3 top-3 text-[11px] tabular-nums text-neutral-600">0/190</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const saveStatusEl = document.getElementById('bp-save-status');
  const previewBannerImg = document.getElementById('bp-preview-banner-img');
  const previewAvatarImg = document.getElementById('bp-preview-avatar-img');
  const previewName = document.getElementById('bp-preview-name');
  const previewBioWrap = document.getElementById('bp-preview-bio-wrap');
  const previewBio = document.getElementById('bp-preview-bio');

  const nickInput = document.getElementById('bp-nickname-input');
  const nickCounter = document.getElementById('bp-nickname-counter');

  const avatarDropzone = document.getElementById('bp-avatar-dropzone');
  const avatarThumb = document.getElementById('bp-avatar-thumb');
  const avatarPlaceholder = document.getElementById('bp-avatar-placeholder');
  const avatarUploadBtn = document.getElementById('bp-avatar-upload-btn');
  const avatarUrlBtn = document.getElementById('bp-avatar-url-btn');
  const avatarRemoveBtn = document.getElementById('bp-avatar-remove-btn');
  const avatarUrlDrawer = document.getElementById('bp-avatar-url-drawer');
  const avatarUrlInput = document.getElementById('bp-avatar-url-input');
  const avatarUrlApply = document.getElementById('bp-avatar-url-apply');
  const avatarFileInput = document.getElementById('bp-avatar-file-input');

  const bannerDropzone = document.getElementById('bp-banner-dropzone');
  const bannerThumb = document.getElementById('bp-banner-thumb');
  const bannerPlaceholder = document.getElementById('bp-banner-placeholder');
  const bannerUploadBtn = document.getElementById('bp-banner-upload-btn');
  const bannerUrlBtn = document.getElementById('bp-banner-url-btn');
  const bannerRemoveBtn = document.getElementById('bp-banner-remove-btn');
  const bannerUrlDrawer = document.getElementById('bp-banner-url-drawer');
  const bannerUrlInput = document.getElementById('bp-banner-url-input');
  const bannerUrlApply = document.getElementById('bp-banner-url-apply');
  const bannerFileInput = document.getElementById('bp-banner-file-input');

  const bioInput = document.getElementById('bp-bio-input');
  const bioCounter = document.getElementById('bp-bio-counter');

  function setStatus(text, tone = 'neutral') {
    if (!saveStatusEl) return;
    saveStatusEl.textContent = text;
    saveStatusEl.className = 'text-xs transition-colors ' + (
      tone === 'saving' ? 'text-neutral-400' :
      tone === 'saved' ? 'text-emerald-400' :
      tone === 'error' ? 'text-red-400' :
      'text-neutral-600'
    );
  }

  function syncPreview() {
    const displayNick = (state.nickname || '').trim() || state.default_name || 'Orbit';
    if (previewName) previewName.textContent = displayNick;
    if (nickCounter) nickCounter.textContent = `${(state.nickname || '').length}/32`;

    const avatarSrc = (state.avatar_url || '').trim() || state.default_avatar || '/img/logo.png';
    if (previewAvatarImg) previewAvatarImg.src = avatarSrc;

    if (state.avatar_url && state.avatar_url.trim()) {
      if (avatarThumb) {
        avatarThumb.src = state.avatar_url.trim();
        avatarThumb.classList.remove('hidden');
      }
      if (avatarPlaceholder) avatarPlaceholder.classList.add('hidden');
      if (avatarRemoveBtn) avatarRemoveBtn.classList.remove('hidden');
    } else {
      if (avatarThumb) {
        avatarThumb.src = '';
        avatarThumb.classList.add('hidden');
      }
      if (avatarPlaceholder) avatarPlaceholder.classList.remove('hidden');
      if (avatarRemoveBtn) avatarRemoveBtn.classList.add('hidden');
    }

    if (state.banner_url && state.banner_url.trim()) {
      const bUrl = state.banner_url.trim();
      if (previewBannerImg) {
        previewBannerImg.src = bUrl;
        previewBannerImg.classList.remove('hidden');
      }
      if (bannerThumb) {
        bannerThumb.src = bUrl;
        bannerThumb.classList.remove('hidden');
      }
      if (bannerPlaceholder) bannerPlaceholder.classList.add('hidden');
      if (bannerRemoveBtn) bannerRemoveBtn.classList.remove('hidden');
    } else {
      if (previewBannerImg) {
        previewBannerImg.src = '';
        previewBannerImg.classList.add('hidden');
      }
      if (bannerThumb) {
        bannerThumb.src = '';
        bannerThumb.classList.add('hidden');
      }
      if (bannerPlaceholder) bannerPlaceholder.classList.remove('hidden');
      if (bannerRemoveBtn) bannerRemoveBtn.classList.add('hidden');
    }

    const bioText = (state.bio || '').trim();
    if (bioCounter) bioCounter.textContent = `${(state.bio || '').length}/190`;
    if (previewBioWrap && previewBio) {
      if (bioText) {
        previewBio.textContent = bioText;
        previewBioWrap.classList.remove('hidden');
      } else {
        previewBio.textContent = '';
        previewBioWrap.classList.add('hidden');
      }
    }
  }

  async function saveNow() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    setStatus('Saving...', 'saving');
    try {
      await API.saveBotProfile(guildId, {
        nickname: state.nickname,
        avatar_url: state.avatar_url,
        banner_url: state.banner_url,
        bio: state.bio
      });
      setStatus('Auto-saved', 'saved');
      setTimeout(() => {
        if (saveStatusEl && saveStatusEl.textContent === 'Auto-saved') {
          setStatus('Auto-saved', 'neutral');
        }
      }, 2000);
    } catch (err) {
      setStatus('Failed to save', 'error');
      if (window.Toast) Toast.error('Failed to update bot profile: ' + err.message);
    }
  }

  function scheduleAutoSave() {
    setStatus('Saving...', 'saving');
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveNow();
    }, 650);
  }

  async function handleFileUpload(file, fieldKey) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      if (window.Toast) Toast.error('Please select an image file (PNG, JPG, WEBP, GIF).');
      return;
    }
    setStatus('Uploading...', 'saving');
    try {
      const res = await API.uploadImage(file);
      if (res && res.url) {
        state[fieldKey] = res.url;
        syncPreview();
        await saveNow();
      }
    } catch (err) {
      // Fallback to FileReader data URL if upload endpoint fails
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          state[fieldKey] = String(ev.target.result);
          syncPreview();
          await saveNow();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  function bindDropzone(zoneEl, fileInputEl, fieldKey) {
    if (!zoneEl || !fileInputEl) return;
    zoneEl.onclick = () => fileInputEl.click();
    zoneEl.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInputEl.click();
      }
    };
    zoneEl.ondragover = (e) => {
      e.preventDefault();
      zoneEl.classList.add('border-white/40', 'bg-neutral-900');
    };
    zoneEl.ondragleave = () => {
      zoneEl.classList.remove('border-white/40', 'bg-neutral-900');
    };
    zoneEl.ondrop = (e) => {
      e.preventDefault();
      zoneEl.classList.remove('border-white/40', 'bg-neutral-900');
      const file = e.dataTransfer?.files?.[0];
      if (file) handleFileUpload(file, fieldKey);
    };
    fileInputEl.onchange = () => {
      const file = fileInputEl.files?.[0];
      if (file) handleFileUpload(file, fieldKey);
      fileInputEl.value = '';
    };
  }

  // Bind Nickname & Bio inputs
  if (nickInput) {
    nickInput.oninput = () => {
      state.nickname = nickInput.value.slice(0, 32);
      syncPreview();
      scheduleAutoSave();
    };
  }

  if (bioInput) {
    bioInput.oninput = () => {
      state.bio = bioInput.value.slice(0, 190);
      syncPreview();
      scheduleAutoSave();
    };
  }

  // Bind Avatar controls
  bindDropzone(avatarDropzone, avatarFileInput, 'avatar_url');
  if (avatarUploadBtn && avatarFileInput) {
    avatarUploadBtn.onclick = () => avatarFileInput.click();
  }
  if (avatarUrlBtn && avatarUrlDrawer) {
    avatarUrlBtn.onclick = () => {
      avatarUrlDrawer.classList.toggle('hidden');
      if (!avatarUrlDrawer.classList.contains('hidden') && avatarUrlInput) {
        avatarUrlInput.value = state.avatar_url.startsWith('data:') ? '' : state.avatar_url;
        avatarUrlInput.focus();
      }
    };
  }
  if (avatarUrlApply && avatarUrlInput) {
    const applyAvatarUrl = () => {
      state.avatar_url = avatarUrlInput.value.trim();
      if (avatarUrlDrawer) avatarUrlDrawer.classList.add('hidden');
      syncPreview();
      saveNow();
    };
    avatarUrlApply.onclick = applyAvatarUrl;
    avatarUrlInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyAvatarUrl();
      }
    };
  }
  if (avatarRemoveBtn) {
    avatarRemoveBtn.onclick = () => {
      state.avatar_url = '';
      if (avatarUrlInput) avatarUrlInput.value = '';
      syncPreview();
      saveNow();
    };
  }

  // Bind Banner controls
  bindDropzone(bannerDropzone, bannerFileInput, 'banner_url');
  if (bannerUploadBtn && bannerFileInput) {
    bannerUploadBtn.onclick = () => bannerFileInput.click();
  }
  if (bannerUrlBtn && bannerUrlDrawer) {
    bannerUrlBtn.onclick = () => {
      bannerUrlDrawer.classList.toggle('hidden');
      if (!bannerUrlDrawer.classList.contains('hidden') && bannerUrlInput) {
        bannerUrlInput.value = state.banner_url.startsWith('data:') ? '' : state.banner_url;
        bannerUrlInput.focus();
      }
    };
  }
  if (bannerUrlApply && bannerUrlInput) {
    const applyBannerUrl = () => {
      state.banner_url = bannerUrlInput.value.trim();
      if (bannerUrlDrawer) bannerUrlDrawer.classList.add('hidden');
      syncPreview();
      saveNow();
    };
    bannerUrlApply.onclick = applyBannerUrl;
    bannerUrlInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyBannerUrl();
      }
    };
  }
  if (bannerRemoveBtn) {
    bannerRemoveBtn.onclick = () => {
      state.banner_url = '';
      if (bannerUrlInput) bannerUrlInput.value = '';
      syncPreview();
      saveNow();
    };
  }

  // Load current Bot Profile from API
  try {
    const profile = await API.getBotProfile(guildId);
    if (profile) {
      state.nickname = profile.nickname || '';
      state.avatar_url = profile.avatar_url || profile.avatar || '';
      state.banner_url = profile.banner_url || profile.banner || '';
      state.bio = profile.bio || '';
      if (profile.default_name) state.default_name = profile.default_name;
      if (profile.default_avatar) state.default_avatar = profile.default_avatar;
    }
    if (nickInput) {
      nickInput.placeholder = state.default_name || 'Orbit';
      nickInput.value = state.nickname;
    }
    if (bioInput) {
      bioInput.value = state.bio;
    }
    syncPreview();
  } catch (_) {
    syncPreview();
  }
};

DashboardTabs.Invites = async function(container, guildId) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">Invite Tracker</h1>
          <p class="text-xs text-neutral-400 mt-1">Track member referrals, vanity links, and fake invite detection.</p>
        </div>
      </div>
      <div class="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 text-xs">
        Invite tracking engine is actively recording join sources and tracking member invitations in real time. Use <code>/invites</code> and <code>/inviteleaderboard</code> in Discord to view full metrics.
      </div>
    </div>
  `;
};

DashboardTabs.Security = async function(container, guildId) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">Security & Anti-Raid</h1>
          <p class="text-xs text-neutral-400 mt-1">Honeypots, suspicious account lockdowns, and anti-nuke thresholds.</p>
        </div>
      </div>
      <div class="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 text-xs">
        Anti-Raid protections and rate limiters are active globally for this server. Honeypot channel alerts and verification gates can be configured under the Verification tab.
      </div>
    </div>
  `;
};

DashboardTabs.Settings = async function(container, guildId) {
  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  container.innerHTML = `
    <div>
      <div data-tour="feature-header" class="scroll-mt-24">
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings w-5 h-5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </span>
            <h1 class="text-base font-medium text-white truncate">Server Settings</h1>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <div class="space-y-5">
          <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div class="px-4 sm:px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-[18px] h-[18px] text-neutral-400 shrink-0"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-semibold text-white">Dashboard Access</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="px-4 sm:px-5 py-4">
              <div class="space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div class="min-w-0 flex-1">
                    <label class="text-sm text-neutral-200 block mb-2">Who gets in</label>
                    <div class="relative" id="access-target-wrap">
                      <button type="button" id="access-target-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                        <div class="flex items-center gap-2.5 min-w-0 flex-1" id="access-target-display">
                          <span class="text-neutral-500">Search people and roles</span>
                        </div>
                        <svg id="access-target-chevron" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
                      </button>

                      <!-- Dropdown menu for people & roles -->
                      <div id="access-target-dropdown" class="hidden absolute left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-40 overflow-hidden">
                        <div class="p-2 border-b border-neutral-800">
                          <div class="relative flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search w-3.5 h-3.5 text-neutral-500 absolute left-2.5 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                            <input type="text" id="access-target-search" placeholder="Search people and roles..." class="w-full h-8 pl-8 pr-3 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500">
                          </div>
                        </div>
                        <div id="access-target-options" class="max-h-60 overflow-y-auto p-1.5 divide-y divide-neutral-800/60"></div>
                      </div>
                    </div>
                  </div>

                  <div class="w-full sm:w-[186px] shrink-0">
                    <label class="text-sm text-neutral-200 block mb-2">Level</label>
                    <div class="relative" id="access-level-wrap">
                      <button type="button" id="access-level-btn" class="w-full flex items-center justify-between gap-2 h-10 px-3 bg-neutral-800 border rounded-xl text-sm text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                        <div class="flex items-center gap-2.5 min-w-0 flex-1">
                          <span id="access-level-display" class="truncate text-white">Viewer</span>
                        </div>
                        <svg id="access-level-chevron" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
                      </button>

                      <!-- Dropdown menu for level -->
                      <div id="access-level-dropdown" class="hidden absolute left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-40 overflow-hidden p-1.5 space-y-0.5">
                        ${['Viewer', 'Editor', 'Admin'].map(lvl => `
                          <button type="button" data-level="${lvl}" class="access-level-opt w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left hover:bg-neutral-800 transition-colors cursor-pointer ${lvl === 'Viewer' ? 'text-white bg-neutral-800/60 font-medium' : 'text-neutral-300'}">
                            <span>${lvl}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-3.5 h-3.5 text-white ${lvl === 'Viewer' ? '' : 'hidden'}"><path d="M20 6 9 17l-5-5"></path></svg>
                          </button>
                        `).join('')}
                      </div>
                    </div>
                  </div>

                  <button type="button" id="grant-access-btn" disabled="" class="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-[transform,background-color,color,border-color] duration-150 ease-out enabled:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 focus-visible:ring-indigo-500/40 !h-10 !px-4 !text-sm w-full sm:w-auto shrink-0 justify-center cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-plus w-3.5 h-3.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>Grant access</button>
                </div>

                <div id="access-list-container" class="border-t border-neutral-800/60 pt-3">
                  <p class="text-[11px] text-neutral-600 py-2">Nobody has access yet. You and anyone with Administrator always have access.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  let roles = [];
  let members = [];
  let accessList = [];
  let selectedTarget = null;
  let selectedLevel = 'Viewer';

  const targetBtn = document.getElementById('access-target-btn');
  const targetDisplay = document.getElementById('access-target-display');
  const targetDropdown = document.getElementById('access-target-dropdown');
  const targetChevron = document.getElementById('access-target-chevron');
  const targetSearch = document.getElementById('access-target-search');
  const targetOptions = document.getElementById('access-target-options');

  const levelBtn = document.getElementById('access-level-btn');
  const levelDisplay = document.getElementById('access-level-display');
  const levelDropdown = document.getElementById('access-level-dropdown');
  const levelChevron = document.getElementById('access-level-chevron');

  const grantBtn = document.getElementById('grant-access-btn');
  const listContainer = document.getElementById('access-list-container');

  function updateTargetButton() {
    if (!selectedTarget) {
      targetDisplay.innerHTML = `<span class="text-neutral-500">Search people and roles</span>`;
      grantBtn.disabled = true;
    } else {
      const badge = selectedTarget.type === 'role'
        ? `<span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${esc(selectedTarget.color || '#99aab5')}"></span>`
        : `<img src="${esc(selectedTarget.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png')}" alt="" class="w-4 h-4 rounded-full object-cover flex-shrink-0">`;
      targetDisplay.innerHTML = `
        ${badge}
        <span class="truncate text-white">${esc(selectedTarget.name)}</span>
        <span class="text-[10px] px-1.5 py-0.5 rounded bg-neutral-700/70 text-neutral-400 uppercase tracking-wider flex-shrink-0">${selectedTarget.type === 'role' ? 'Role' : 'User'}</span>
      `;
      grantBtn.disabled = false;
    }
  }

  function renderDropdownOptions(query = '') {
    const q = query.trim().toLowerCase();
    const existingKeys = new Set(accessList.map(item => `${item.type}:${item.id}`));

    const filteredRoles = roles.filter(r => !existingKeys.has(`role:${r.id}`) && r.name.toLowerCase().includes(q));
    const filteredMembers = members.filter(m => !existingKeys.has(`user:${m.id}`) && (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.username && m.username.toLowerCase().includes(q))
    ));

    if (!filteredRoles.length && !filteredMembers.length) {
      targetOptions.innerHTML = `<div class="px-3 py-4 text-center text-xs text-neutral-500">No matching people or roles found</div>`;
      return;
    }

    let html = '';
    if (filteredRoles.length) {
      html += `
        <div class="pb-1.5">
          <p class="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Roles</p>
          <div class="space-y-0.5">
            ${filteredRoles.map(r => {
              const colorHex = r.color && r.color !== '#000000' ? r.color : '#99aab5';
              return `
                <button type="button" data-type="role" data-id="${esc(r.id)}" data-name="${esc(r.name)}" data-color="${esc(colorHex)}" class="access-opt-item w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-neutral-200 hover:bg-neutral-800 transition-colors text-left cursor-pointer">
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${esc(colorHex)}"></span>
                  <span class="truncate flex-1 font-medium">${esc(r.name)}</span>
                  <span class="text-[10px] text-neutral-500">Role</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    if (filteredMembers.length) {
      html += `
        <div class="${filteredRoles.length ? 'pt-1.5' : ''}">
          <p class="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">People</p>
          <div class="space-y-0.5">
            ${filteredMembers.map(m => `
              <button type="button" data-type="user" data-id="${esc(m.id)}" data-name="${esc(m.name || m.username)}" data-username="${esc(m.username || '')}" data-avatar="${esc(m.avatar || '')}" class="access-opt-item w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-neutral-200 hover:bg-neutral-800 transition-colors text-left cursor-pointer">
                <img src="${esc(m.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png')}" alt="" class="w-4 h-4 rounded-full object-cover flex-shrink-0">
                <span class="truncate flex-1 font-medium">${esc(m.name || m.username)}</span>
                <span class="text-[10px] text-neutral-500 truncate max-w-[100px]">@${esc(m.username || '')}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    targetOptions.innerHTML = html;

    targetOptions.querySelectorAll('.access-opt-item').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        selectedTarget = {
          type: btn.getAttribute('data-type'),
          id: btn.getAttribute('data-id'),
          name: btn.getAttribute('data-name'),
          username: btn.getAttribute('data-username') || '',
          avatar: btn.getAttribute('data-avatar') || '',
          color: btn.getAttribute('data-color') || '#99aab5'
        };
        updateTargetButton();
        targetDropdown.classList.add('hidden');
        targetChevron.classList.remove('rotate-180');
      };
    });
  }

  async function persistAccessList() {
    const managerRoles = accessList.filter(a => a.type === 'role').map(a => String(a.id));
    const managerUsers = accessList.filter(a => a.type === 'user').map(a => String(a.id));
    await API.saveConfig(guildId, {
      settings: {
        dashboard_access: accessList,
        manager_roles: managerRoles,
        manager_users: managerUsers
      }
    });
  }

  function renderAccessList() {
    if (!accessList.length) {
      listContainer.innerHTML = `<p class="text-[11px] text-neutral-600 py-2">Nobody has access yet. You and anyone with Administrator always have access.</p>`;
      return;
    }

    listContainer.innerHTML = `
      <div class="divide-y divide-neutral-800/60">
        ${accessList.map((item, idx) => {
          const isRole = item.type === 'role';
          const badge = isRole
            ? `<span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${esc(item.color || '#99aab5')}"></span>`
            : `<img src="${esc(item.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png')}" alt="" class="w-5 h-5 rounded-full object-cover flex-shrink-0">`;
          return `
            <div class="flex items-center justify-between gap-3 py-2.5">
              <div class="flex items-center gap-2.5 min-w-0">
                ${badge}
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-white truncate">${esc(item.name || item.id)}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700/70 text-neutral-400 uppercase tracking-wider">${isRole ? 'Role' : 'User'}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-xs px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 font-medium">${esc(item.level || 'Viewer')}</span>
                <button type="button" data-remove-idx="${idx}" class="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer" title="Revoke access">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-4 h-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <p class="text-[11px] text-neutral-600 pt-2">You and anyone with Administrator always have access.</p>
    `;

    listContainer.querySelectorAll('[data-remove-idx]').forEach(btn => {
      btn.onclick = async () => {
        const idx = parseInt(btn.getAttribute('data-remove-idx'), 10);
        if (isNaN(idx)) return;
        accessList.splice(idx, 1);
        renderAccessList();
        renderDropdownOptions(targetSearch.value);
        try {
          await persistAccessList();
          Toast.success('Access removed');
        } catch (err) {
          Toast.error('Failed to update access: ' + err.message);
        }
      };
    });
  }

  targetBtn.onclick = (e) => {
    e.stopPropagation();
    const isHidden = targetDropdown.classList.contains('hidden');
    levelDropdown.classList.add('hidden');
    levelChevron.classList.remove('rotate-180');
    if (isHidden) {
      renderDropdownOptions(targetSearch.value);
      targetDropdown.classList.remove('hidden');
      targetChevron.classList.add('rotate-180');
      setTimeout(() => targetSearch.focus(), 20);
    } else {
      targetDropdown.classList.add('hidden');
      targetChevron.classList.remove('rotate-180');
    }
  };

  targetDropdown.onclick = (e) => e.stopPropagation();
  targetSearch.oninput = () => renderDropdownOptions(targetSearch.value);

  levelBtn.onclick = (e) => {
    e.stopPropagation();
    const isHidden = levelDropdown.classList.contains('hidden');
    targetDropdown.classList.add('hidden');
    targetChevron.classList.remove('rotate-180');
    if (isHidden) {
      levelDropdown.classList.remove('hidden');
      levelChevron.classList.add('rotate-180');
    } else {
      levelDropdown.classList.add('hidden');
      levelChevron.classList.remove('rotate-180');
    }
  };

  levelDropdown.querySelectorAll('.access-level-opt').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      selectedLevel = btn.getAttribute('data-level') || 'Viewer';
      levelDisplay.textContent = selectedLevel;
      levelDropdown.querySelectorAll('.access-level-opt').forEach(opt => {
        const active = opt.getAttribute('data-level') === selectedLevel;
        opt.className = `access-level-opt w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left hover:bg-neutral-800 transition-colors cursor-pointer ${active ? 'text-white bg-neutral-800/60 font-medium' : 'text-neutral-300'}`;
        const check = opt.querySelector('svg');
        if (check) check.classList.toggle('hidden', !active);
      });
      levelDropdown.classList.add('hidden');
      levelChevron.classList.remove('rotate-180');
    };
  });

  document.addEventListener('click', () => {
    targetDropdown.classList.add('hidden');
    targetChevron.classList.remove('rotate-180');
    levelDropdown.classList.add('hidden');
    levelChevron.classList.remove('rotate-180');
  });

  grantBtn.onclick = async () => {
    if (!selectedTarget) return;
    grantBtn.disabled = true;
    const entry = {
      type: selectedTarget.type,
      id: String(selectedTarget.id),
      name: selectedTarget.name,
      username: selectedTarget.username || '',
      avatar: selectedTarget.avatar || '',
      color: selectedTarget.color || '#99aab5',
      level: selectedLevel
    };
    const existingIdx = accessList.findIndex(a => a.type === entry.type && String(a.id) === entry.id);
    if (existingIdx >= 0) {
      accessList[existingIdx] = entry;
    } else {
      accessList.push(entry);
    }
    selectedTarget = null;
    targetSearch.value = '';
    updateTargetButton();
    renderAccessList();
    renderDropdownOptions('');

    try {
      await persistAccessList();
      Toast.success('Dashboard access granted');
    } catch (err) {
      Toast.error('Failed to grant access: ' + err.message);
    }
  };

  try {
    const data = await API.getConfig(guildId);
    roles = Array.isArray(data.roles) ? data.roles : [];
    members = Array.isArray(data.members) ? data.members : [];
    const s = data.config?.settings || data.config?.Settings || data.settings || data.Settings || {};
    if (Array.isArray(s.dashboard_access)) {
      accessList = s.dashboard_access.map(item => {
        if (item.type === 'role') {
          const rMatch = roles.find(r => String(r.id) === String(item.id));
          return {
            ...item,
            name: item.name || (rMatch ? rMatch.name : `Role ${item.id}`),
            color: item.color || (rMatch && rMatch.color !== '#000000' ? rMatch.color : '#99aab5')
          };
        } else {
          const mMatch = members.find(m => String(m.id) === String(item.id));
          return {
            ...item,
            name: item.name || (mMatch ? mMatch.name : `User ${item.id}`),
            avatar: item.avatar || (mMatch ? mMatch.avatar : '')
          };
        }
      });
    }
    renderAccessList();
  } catch (_) {}
};

DashboardTabs.Analytics = async function(container, guildId) {
  function esc(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtNum(e) {
    const n = Number(e) || 0;
    if (n < 0) return '-' + fmtNum(-n);
    if (n < 1000) return n.toLocaleString();
    if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    if (n < 1000000) return Math.round(n / 1000) + 'k';
    return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }

  function fmtVoice(e) {
    const n = Number(e) || 0;
    if (n < 1) return '0m';
    if (n < 60) return `${Math.round(n)}m`;
    const h = Math.floor(n / 60);
    const m = Math.round(n % 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  const SVGS = {
    activity: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity w-3.5 h-3.5"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-3.5 h-3.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    hash: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hash w-3.5 h-3.5"><line x1="4" x2="20" y1="9" y2="9"></line><line x1="4" x2="20" y1="15" y2="15"></line><line x1="10" x2="8" y1="3" y2="21"></line><line x1="16" x2="14" y1="3" y2="21"></line></svg>`,
    shieldAlert: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-alert w-3.5 h-3.5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>`,
    alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert w-3.5 h-3.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>`,
    trendingUp: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-3.5 h-3.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>`,
    trendingDown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-down w-3.5 h-3.5"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg>`,
    messageSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square w-3 h-3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    userCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-check w-3 h-3"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>`,
    mic: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic w-3 h-3"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>`,
    ticket: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket w-3 h-3"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>`,
    checkCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check w-3 h-3"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock w-3 h-3"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right w-3 h-3"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>`,
    arrowDown: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down w-3 h-3"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-2.5 h-2.5 flex-shrink-0"><path d="M20 6 9 17l-5-5"></path></svg>`
  };

  const HERO_METRICS = {
    messages: { label: 'Messages', icon: SVGS.messageSquare, color: 'text-blue-400', stroke: '#3b82f6' },
    activeUsers: { label: 'Active Users', icon: SVGS.userCheck, color: 'text-violet-400', stroke: '#8b5cf6' },
    voiceMinutes: { label: 'Voice Time', icon: SVGS.mic, color: 'text-amber-400', stroke: '#f59e0b' },
    members: { label: 'Members', icon: SVGS.users, color: 'text-emerald-400', stroke: '#10b981' }
  };

  const SECTIONS = [
    { id: 'engagement', label: 'Engagement', icon: SVGS.activity },
    { id: 'people', label: 'People', icon: SVGS.users },
    { id: 'activity', label: 'Activity', icon: SVGS.hash },
    { id: 'moderation', label: 'Moderation', icon: SVGS.shieldAlert },
    { id: 'safety', label: 'Safety', icon: SVGS.alertTriangle },
    { id: 'growth', label: 'Growth', icon: SVGS.trendingUp }
  ];

  const SOURCE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];
  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let activeSection = 'engagement';
  let timeRange = 7;
  let heroMetric = 'messages';
  let analyticsData = null;
  let isLoading = true;

  function renderSparklineSvg(data, color, gradId) {
    if (!Array.isArray(data) || data.length <= 1) return '';
    const min = Math.min(...data);
    const range = (Math.max(...data) - min) || 1;
    const step = 100 / (data.length - 1);
    const pts = data.map((v, idx) => `${(idx * step).toFixed(2)},${(42 - ((v - min) / range) * 34 - 4).toFixed(2)}`).join(' ');
    const polyPts = `0,42 ${pts} 100,42`;
    return `
      <svg width="100%" height="100%" viewBox="0 0 100 42" preserveAspectRatio="none" class="block">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.18"></stop>
            <stop offset="100%" stop-color="${color}" stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        <polygon points="${polyPts}" fill="url(#${gradId})"></polygon>
        <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></polyline>
      </svg>
    `;
  }

  function renderKpiCard({ metricKey, label, value, delta, sparkline, iconSvg, iconColor, accent, formatDelta = fmtNum, clickable = false, isActive = false }) {
    const chg = delta ? (Number(delta.change) || 0) : 0;
    const pct = delta ? (Number(delta.percent) || 0) : 0;
    const isPos = chg > 0;
    const isNeg = chg < 0;
    const tag = clickable ? 'button' : 'div';
    const extraAttrs = clickable ? `type="button" data-kpi-metric="${metricKey}"` : '';

    let deltaHtml = '';
    if (delta !== undefined) {
      if (isPos || isNeg) {
        deltaHtml = `
          <div class="flex items-center gap-1 mt-1.5 h-3.5">
            <span class="${isPos ? 'text-emerald-400' : 'text-red-400'}">${isPos ? SVGS.trendingUp : SVGS.trendingDown}</span>
            <span class="text-[11px] font-medium tabular-nums ${isPos ? 'text-emerald-400' : 'text-red-400'}">
              ${isPos ? '+' : ''}${formatDelta(chg)}${Number.isFinite(pct) && pct !== 0 ? `<span class="opacity-75 ml-1">(${Math.abs(pct).toFixed(0)}%)</span>` : ''}
            </span>
          </div>
        `;
      } else {
        deltaHtml = `<div class="flex items-center gap-1 mt-1.5 h-3.5"><span class="text-[11px] text-neutral-600">No change</span></div>`;
      }
    }

    return `
      <${tag} ${extraAttrs} class="relative bg-neutral-900 rounded-2xl border overflow-hidden flex flex-col shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] transition-colors ${isActive ? 'border-neutral-600' : 'border-neutral-800'} ${clickable ? 'hover:border-neutral-700 text-left cursor-pointer' : ''}">
        <div class="px-4 pt-4 pb-3">
          <div class="flex items-center gap-1.5">
            <span class="${iconColor}">${iconSvg}</span>
            <p class="text-[11px] text-neutral-500 font-medium leading-none">${esc(label)}</p>
          </div>
          <p class="text-[28px] font-bold text-white tabular-nums leading-none mt-2">${esc(value)}</p>
          ${deltaHtml}
        </div>
        ${sparkline && sparkline.length > 1 ? `<div class="h-[42px] w-full mt-auto">${renderSparklineSvg(sparkline, accent, `spark-${metricKey || label.replace(/\s+/g, '')}`)}</div>` : ''}
      </${tag}>
    `;
  }

  function renderEntityBadge(row, kind) {
    if (kind === 'raw') {
      return `
        <span class="inline-flex items-center gap-1 min-w-0 px-1.5 py-0.5 bg-neutral-800/60 border border-neutral-700/60 rounded w-fit max-w-full">
          <span class="text-[11px] text-neutral-200 truncate">${esc(row.name || row.id)}</span>
        </span>
      `;
    }
    const isUser = kind === 'user';
    const activeCls = isUser
      ? 'bg-violet-500/15 border-violet-500/20 text-violet-200 hover:bg-violet-500/25'
      : 'bg-indigo-500/15 border-indigo-500/20 text-indigo-200 hover:bg-indigo-500/25';
    const sym = isUser ? '@' : '#';
    const symColor = isUser ? 'text-violet-300' : 'text-indigo-300';
    return `
      <button type="button" data-copy-entity="${esc(row.id)}" title="${esc(row.name)} · click to copy ID (${esc(row.id)})" class="inline-flex items-center gap-1 min-w-0 px-1.5 py-0.5 rounded w-fit max-w-full transition-colors cursor-pointer border ${activeCls}">
        <span class="text-[10px] leading-none ${symColor}">${sym}</span>
        <span class="text-[11px] truncate font-medium">${esc(row.name)}</span>
      </button>
    `;
  }

  function renderTableCard({ title, subtitle, action, columns = { label: 'Item', count: 'Count', share: '% of Total', change: 'Change' }, rows = [], ringColor = 'text-emerald-500', inverseChange = false, formatCount = null, emptyTitle = 'No data yet', emptyHint = 'Analytics will populate as your server generates activity.' }) {
    const hasRows = Array.isArray(rows) && rows.length > 0;
    return `
      <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
        <div class="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-sm text-white font-semibold">${esc(title)}</p>
            </div>
            ${subtitle ? `<p class="text-[11px] text-neutral-500 mt-0.5">${esc(subtitle)}</p>` : ''}
          </div>
          ${action ? `
            <a href="${esc(action.href)}" class="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
              ${esc(action.label)}
              ${SVGS.arrowRight}
            </a>
          ` : ''}
        </div>
        <div class="flex-1 px-2 pb-3">
          ${!hasRows ? `
            <div class="h-[160px] flex flex-col items-center justify-center text-center px-4">
              <div class="text-neutral-700 mb-2">${SVGS.hash}</div>
              <p class="text-sm text-neutral-300 font-medium">${esc(emptyTitle)}</p>
              <p class="text-[11px] text-neutral-600 mt-1">${esc(emptyHint)}</p>
            </div>
          ` : `
            <div>
              <div class="grid grid-cols-[minmax(0,1.5fr)_minmax(52px,auto)_minmax(72px,auto)] gap-2 sm:grid-cols-[minmax(0,1.4fr)_minmax(70px,1fr)_minmax(90px,1fr)_minmax(110px,1fr)] sm:gap-3 px-2.5 pb-1.5">
                <span class="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.06em]">${esc(columns.label)}</span>
                <span class="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.06em]">${esc(columns.count)}</span>
                <span class="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.06em]">${esc(columns.share)}</span>
                <span class="hidden sm:block text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.06em]">${esc(columns.change)}</span>
              </div>
              <div class="divide-y divide-neutral-800/40" ${rows.length > 4 ? 'style="max-height:152px;overflow-y:auto;padding-right:4px;"' : ''}>
                ${rows.map(r => {
                  const pct = Math.round((Number(r.share) || 0) * 100);
                  const dash = ((pct / 100) * 94.2).toFixed(1);
                  const chg = Number(r.change) || 0;
                  const hasChg = chg !== 0;
                  const isPos = chg >= 0;
                  const posColor = inverseChange ? 'text-amber-400' : 'text-emerald-400';
                  const negColor = inverseChange ? 'text-emerald-400' : 'text-amber-400';
                  const displayCount = formatCount ? formatCount(r.count) : (typeof r.count === 'number' ? r.count.toLocaleString() : r.count);
                  return `
                    <div class="grid grid-cols-[minmax(0,1.5fr)_minmax(52px,auto)_minmax(72px,auto)] gap-2 sm:grid-cols-[minmax(0,1.4fr)_minmax(70px,1fr)_minmax(90px,1fr)_minmax(110px,1fr)] sm:gap-3 items-center px-2.5 py-1.5 hover:bg-white/[0.02] transition-colors">
                      <div class="min-w-0">${r.labelHtml}</div>
                      <span class="text-sm text-white font-semibold tabular-nums">${esc(displayCount)}</span>
                      <div class="flex items-center gap-1.5">
                        <div class="relative w-5 h-5 flex-shrink-0">
                          <svg viewBox="0 0 36 36" class="w-5 h-5 -rotate-90">
                            <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" stroke-width="4" class="text-neutral-700"></circle>
                            <circle cx="18" cy="18" r="15" fill="none" stroke-width="4" stroke-linecap="round" stroke-dasharray="${dash} 94.2" class="${ringColor}"></circle>
                          </svg>
                        </div>
                        <span class="text-xs text-neutral-200 tabular-nums">${pct}%</span>
                      </div>
                      ${hasChg ? `
                        <span class="hidden sm:inline-block text-xs tabular-nums font-medium ${isPos ? posColor : negColor}">
                          ${isPos ? '+' : ''}${chg.toLocaleString()}${r.changePct !== null && r.changePct !== undefined ? `<span class="ml-1 text-[10px] opacity-90">(${Math.abs(r.changePct).toFixed(1)}%)</span>` : ''}
                        </span>
                      ` : `<span class="hidden sm:inline-block text-xs text-neutral-600">-</span>`}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `}
        </div>
      </div>
    `;
  }

  function buildSmoothSvgAreaChart(points, prevPoints, strokeColor, fmtFn) {
    const W = 720, H = 220;
    const padL = 38, padR = 12, padT = 12, padB = 26;
    const cW = W - padL - padR;
    const cH = H - padT - padB;
    const vals = points.map(p => Number(p.value) || 0);
    const pVals = (prevPoints || []).map(p => Number(p.value) || 0);
    const maxV = Math.max(4, ...vals, ...pVals);
    const n = points.length;

    const toX = (i) => padL + (n > 1 ? (i / (n - 1)) * cW : cW / 2);
    const toY = (v) => padT + cH - (v / maxV) * cH;

    function monotonePath(arr) {
      if (!arr.length) return '';
      const coords = arr.map((v, i) => ({ x: toX(i), y: toY(v) }));
      if (coords.length === 1) return `M ${coords[0].x},${coords[0].y}`;
      let d = `M ${coords[0].x.toFixed(1)},${coords[0].y.toFixed(1)}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const p0 = coords[i];
        const p1 = coords[i + 1];
        const cx1 = p0.x + (p1.x - p0.x) * 0.45;
        const cx2 = p1.x - (p1.x - p0.x) * 0.45;
        d += ` C ${cx1.toFixed(1)},${p0.y.toFixed(1)} ${cx2.toFixed(1)},${p1.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
      }
      return d;
    }

    const linePath = monotonePath(vals);
    const areaPath = `${linePath} L ${toX(n - 1).toFixed(1)},${(padT + cH).toFixed(1)} L ${toX(0).toFixed(1)},${(padT + cH).toFixed(1)} Z`;
    const hasPrev = pVals.some(v => v > 0);
    const prevPath = hasPrev ? monotonePath(pVals) : '';

    const peakVal = Math.max(...vals, 0);
    const peakIdx = peakVal > 0 ? vals.findIndex(v => v === peakVal) : -1;

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => {
      const val = Math.round(maxV * f);
      const y = toY(val);
      return { val, y };
    });

    const stepX = Math.max(1, Math.ceil(n / 7));

    return `
      <div class="relative w-full h-[220px] select-none" id="analytics-hero-chart-wrap">
        <svg viewBox="0 0 ${W} ${H}" class="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="engHeroFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.3"></stop>
              <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0"></stop>
            </linearGradient>
          </defs>
          ${yTicks.map(t => `
            <line x1="${padL}" y1="${t.y.toFixed(1)}" x2="${W - padR}" y2="${t.y.toFixed(1)}" stroke="#171717" stroke-width="1"></line>
            <text x="${padL - 6}" y="${(t.y + 3).toFixed(1)}" text-anchor="end" font-size="10" fill="#525252">${esc(fmtFn(t.val))}</text>
          `).join('')}
          ${points.map((p, i) => (i % stepX === 0 || i === n - 1) ? `
            <text x="${toX(i).toFixed(1)}" y="${H - 6}" text-anchor="middle" font-size="10" fill="#525252">${esc(p.label)}</text>
          ` : '').join('')}
          ${hasPrev ? `<path d="${prevPath}" fill="none" stroke="#404040" stroke-width="1.5" stroke-dasharray="4 4"></path>` : ''}
          <path d="${areaPath}" fill="url(#engHeroFill)"></path>
          <path d="${linePath}" fill="none" stroke="${strokeColor}" stroke-width="2"></path>
          ${peakIdx >= 0 ? `<circle cx="${toX(peakIdx).toFixed(1)}" cy="${toY(peakVal).toFixed(1)}" r="5" fill="#facc15" stroke="#ffffff" stroke-width="2"></circle>` : ''}
          <line id="hero-hover-line" x1="0" y1="${padT}" x2="0" y2="${padT + cH}" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="3 3" class="hidden pointer-events-none"></line>
          <circle id="hero-hover-dot" cx="0" cy="0" r="4" fill="${strokeColor}" stroke="#ffffff" stroke-width="2" class="hidden pointer-events-none"></circle>
          ${points.map((p, i) => {
            const sliceW = cW / Math.max(1, n);
            const rx = toX(i) - sliceW / 2;
            return `<rect x="${Math.max(padL, rx).toFixed(1)}" y="${padT}" width="${sliceW.toFixed(1)}" height="${cH}" fill="transparent" class="cursor-crosshair hero-hover-rect" data-idx="${i}" data-x="${toX(i).toFixed(1)}" data-y="${toY(vals[i]).toFixed(1)}" data-label="${esc(p.label)}" data-val="${esc(fmtFn(vals[i]))}"></rect>`;
          }).join('')}
        </svg>
        <div id="hero-hover-tooltip" class="hidden absolute top-2 pointer-events-none bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 shadow-xl z-20"></div>
      </div>
    `;
  }

  function renderLiveBarCard({ title, total, data = [], barInterval = 7, chartId }) {
    const W = 480, H = 180;
    const padL = 28, padR = 8, padT = 8, padB = 22;
    const cW = W - padL - padR;
    const cH = H - padT - padB;
    const counts = data.map(d => Number(d.count) || 0);
    const maxV = Math.max(4, ...counts);
    const n = Math.max(1, data.length);
    const slotW = cW / n;
    const barW = Math.min(10, Math.max(2, slotW * 0.68));

    return `
      <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
        <div class="px-5 pt-5 pb-2 flex items-start justify-between">
          <div>
            <p class="text-[13px] text-neutral-400 font-medium">${esc(title)}</p>
            <p class="text-3xl font-bold text-white tabular-nums mt-1">${Number(total || 0).toLocaleString()}</p>
          </div>
          <div class="flex items-center gap-1.5 mt-1">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span class="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Live</span>
          </div>
        </div>
        <div class="px-5 pb-5">
          <div class="relative w-full h-[180px] select-none" data-live-chart="${chartId}">
            <svg viewBox="0 0 ${W} ${H}" class="w-full h-full overflow-visible">
              ${[0, 0.5, 1].map(f => {
                const v = Math.round(maxV * f);
                const y = padT + cH - f * cH;
                return `
                  <line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="#171717" stroke-width="1"></line>
                  <text x="${padL - 5}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="9" fill="#525252">${v}</text>
                `;
              }).join('')}
              ${data.map((d, i) => {
                const val = Number(d.count) || 0;
                const bh = val > 0 ? Math.max(3, (val / maxV) * cH) : 2;
                const x = padL + i * slotW + (slotW - barW) / 2;
                const y = padT + cH - bh;
                const showTick = i % barInterval === 0 && d.label;
                return `
                  <g class="live-bar-item cursor-pointer" data-label="${esc(d.fullLabel || d.label || '')}" data-val="${val}">
                    <rect x="${(padL + i * slotW).toFixed(1)}" y="${padT}" width="${slotW.toFixed(1)}" height="${cH}" fill="transparent"></rect>
                    <rect class="live-bar-rect transition-colors" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${bh.toFixed(1)}" rx="2" fill="#22c55e"></rect>
                    ${showTick ? `<text x="${(x + barW / 2).toFixed(1)}" y="${H - 4}" text-anchor="middle" font-size="9" fill="#525252">${esc(d.label)}</text>` : ''}
                  </g>
                `;
              }).join('')}
            </svg>
            <div class="live-bar-tooltip hidden absolute top-2 pointer-events-none bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 shadow-xl z-20"></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderHeatmapCard(heatmap, days) {
    const matrix = heatmap?.matrix || Array.from({ length: 7 }, () => Array(24).fill(0));
    const total = Number(heatmap?.total || 0);
    const maxCount = Number(heatmap?.maxCount || 0);

    let peakDay = 0, peakHour = 0;
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        if (matrix[d][h] === maxCount && maxCount > 0) {
          peakDay = d;
          peakHour = h;
        }
      }
    }

    let tzLabel = 'UTC';
    try {
      const parts = Intl.DateTimeFormat([], { timeZoneName: 'short' }).formatToParts(new Date());
      tzLabel = parts.find(p => p.type === 'timeZoneName')?.value || 'local time';
    } catch (_) {}

    const intensity = (val) => (maxCount === 0 || val === 0) ? 0 : Math.min(1, Math.pow(val / maxCount, 0.6));

    return `
      <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
        <div class="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm text-white font-semibold">Activity by Hour &amp; Day</p>
            <p class="text-[11px] text-neutral-500 mt-0.5">
              Last ${days} days · ${total.toLocaleString()} messages
              ${maxCount > 0 ? `<span class="ml-1.5 text-neutral-600">· peak: <span class="text-emerald-400">${WEEKDAYS[peakDay]} ${String(peakHour).padStart(2, '0')}:00 ${esc(tzLabel)}</span></span>` : ''}
            </p>
          </div>
        </div>
        <div class="px-4 pb-4">
          ${total === 0 ? `
            <div class="h-[200px] flex flex-col items-center justify-center text-center">
              <div class="text-neutral-700 mb-2">${SVGS.clock}</div>
              <p class="text-sm text-neutral-300 font-medium">No hourly data yet</p>
              <p class="text-[11px] text-neutral-600 mt-1">Hourly tracking just started - needs at least a day of activity.</p>
            </div>
          ` : `
            <div>
              <div class="overflow-x-auto">
                <div class="inline-flex flex-col gap-0.5 min-w-full">
                  <div class="flex items-center gap-0.5 mb-1 pl-9">
                    ${Array.from({ length: 24 }, (_, h) => {
                      const isMajor = h === 0 || h === 6 || h === 12 || h === 18;
                      return `<div class="flex-1 min-w-[16px] text-center font-mono tabular-nums ${isMajor ? 'text-[10px] text-neutral-300 font-semibold' : 'text-[9px] text-neutral-600'}">${String(h).padStart(2, '0')}</div>`;
                    }).join('')}
                  </div>
                  <div class="flex items-center gap-0.5 mb-2 pl-9">
                    ${Array.from({ length: 24 }, (_, h) => {
                      const lbl = { 0: '12 AM', 6: '6 AM', 12: 'NOON', 18: '6 PM' }[h] || '';
                      return `<div class="flex-1 min-w-[16px] text-center text-[8px] text-neutral-700 uppercase tracking-wider font-semibold">${lbl}</div>`;
                    }).join('')}
                  </div>
                  ${WEEKDAYS.map((dayName, dIdx) => `
                    <div class="flex items-center gap-0.5">
                      <div class="w-7 text-[10px] text-neutral-500 font-medium uppercase tabular-nums text-right pr-1.5">${dayName}</div>
                      ${Array.from({ length: 24 }, (_, hIdx) => {
                        const val = matrix[dIdx][hIdx] || 0;
                        const r = intensity(val);
                        const isMajor = hIdx === 0 || hIdx === 6 || hIdx === 12 || hIdx === 18;
                        const bg = r === 0 ? 'rgba(255,255,255,0.02)' : `rgba(16, 185, 129, ${(0.1 + 0.7 * r).toFixed(2)})`;
                        return `<div class="heatmap-cell flex-1 min-w-[16px] aspect-square rounded-sm transition-[box-shadow,filter] hover:brightness-150 hover:shadow-[inset_0_0_0_1.5px_rgba(110,231,183,0.9)] cursor-default ${isMajor ? 'border-l border-l-neutral-700/40' : 'border-l border-l-transparent'}" style="background:${bg}" data-day="${dayName}" data-hour="${String(hIdx).padStart(2, '0')}:00" data-val="${val}"></div>`;
                      }).join('')}
                    </div>
                  `).join('')}
                </div>
              </div>
              <div class="flex items-center gap-3 mt-3 justify-between">
                <span class="text-[10px] text-neutral-500">Rows = day of week. Columns = hour (${esc(tzLabel)}).</span>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-neutral-500 tabular-nums">0</span>
                  ${[0.1, 0.3, 0.5, 0.7, 0.9].map(op => `<div class="w-3 h-3 rounded-sm" style="background:rgba(16, 185, 129, ${op})"></div>`).join('')}
                  <span class="text-[10px] text-neutral-500 tabular-nums">${maxCount}</span>
                </div>
              </div>
            </div>
          `}
        </div>
      </div>
    `;
  }

  function renderSectionContent() {
    if (isLoading || !analyticsData) {
      return `
        <div class="space-y-5 pt-6 pb-8">
          <div class="h-[320px] rounded-2xl border border-neutral-800 bg-neutral-900 animate-pulse"></div>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            ${[1, 2, 3, 4].map(() => `<div class="h-[140px] rounded-2xl border border-neutral-800 bg-neutral-900 animate-pulse"></div>`).join('')}
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="h-[240px] rounded-2xl border border-neutral-800 bg-neutral-900 animate-pulse"></div>
            <div class="h-[240px] rounded-2xl border border-neutral-800 bg-neutral-900 animate-pulse"></div>
          </div>
        </div>
      `;
    }

    const T = analyticsData.summaries || {};
    const A = analyticsData.sparklines || {};
    const P = analyticsData.panels || {};
    const chartData = analyticsData.chartData || [];
    const prevChartData = analyticsData.previousChartData || [];

    const decorateRows = (panelObj, kind) => {
      const list = panelObj?.rows || [];
      return list.map(r => ({
        ...r,
        labelHtml: renderEntityBadge(r, kind)
      }));
    };

    if (activeSection === 'engagement') {
      const mMeta = HERO_METRICS[heroMetric] || HERO_METRICS.messages;
      const fmtFn = heroMetric === 'voiceMinutes' ? fmtVoice : fmtNum;
      const mSummary = T[heroMetric] || { current: 0, change: 0, percent: 0 };
      const isPos = (mSummary.change || 0) >= 0;
      const points = chartData.map(d => ({ label: String(d.date), value: Number(d[heroMetric]) || 0 }));
      const prevPoints = prevChartData.map(d => ({ label: String(d.date), value: Number(d[heroMetric]) || 0 }));
      const peakVal = Math.max(0, ...points.map(p => p.value));
      const peakPoint = peakVal > 0 ? points.find(p => p.value === peakVal) : null;
      const avgVal = points.length ? Math.round(points.reduce((s, p) => s + p.value, 0) / points.length) : 0;

      const topMsgRows = decorateRows(P.topMessageChannels, 'channel');
      const topReactChRows = decorateRows(P.topReactionChannels, 'channel');

      return `
        <section id="section-engagement" class="space-y-4">
          <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div class="px-5 pt-4 pb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <div class="flex items-center gap-2">
                <span class="text-emerald-400">${SVGS.activity}</span>
                <span class="text-sm font-medium text-white">${esc(mMeta.label)}</span>
                <span class="text-[11px] text-neutral-500">last ${timeRange} days</span>
              </div>
              <div class="inline-flex flex-wrap gap-1 max-w-full sm:max-w-[60%] justify-end">
                ${Object.entries(HERO_METRICS).map(([k, meta]) => {
                  const active = k === heroMetric;
                  return `
                    <button type="button" data-hero-metric="${k}" class="inline-flex items-center gap-1.5 px-2.5 py-2 sm:py-1 rounded-md text-[11px] font-medium transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] cursor-pointer ${active ? 'bg-white text-black' : 'bg-neutral-800/60 text-neutral-400 hover:bg-neutral-800 hover:text-white'}">
                      ${meta.icon}
                      ${esc(meta.label)}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="px-5 pb-3 flex items-end justify-between gap-6 flex-wrap">
              <div class="flex items-end gap-4">
                <div class="flex flex-col">
                  <span class="text-4xl font-bold text-white tabular-nums leading-none">${esc(fmtFn(mSummary.current))}</span>
                  <span class="text-[11px] text-neutral-500 mt-1">${esc(mMeta.label.toLowerCase())}</span>
                </div>
                ${mSummary.percent !== 0 ? `
                  <div class="flex flex-col pb-0.5">
                    <span class="inline-flex items-center gap-0.5 text-2xl font-bold tabular-nums leading-none ${isPos ? 'text-emerald-400' : 'text-red-400'}">
                      ${isPos ? SVGS.trendingUp : SVGS.trendingDown}
                      ${Math.abs(mSummary.percent).toFixed(1)}%
                    </span>
                    <span class="text-[11px] text-neutral-500 mt-1">${isPos ? '+' : ''}${fmtNum(mSummary.change)} vs prev ${timeRange === 7 ? 'week' : timeRange === 30 ? 'month' : timeRange === 90 ? 'quarter' : 'period'}</span>
                  </div>
                ` : ''}
              </div>
              <div class="flex flex-col items-end gap-1.5">
                ${peakPoint ? `
                  <div class="flex items-baseline gap-1.5">
                    <span class="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Peak</span>
                    <span class="text-sm text-amber-400 font-semibold tabular-nums">${esc(peakPoint.label)}</span>
                    <span class="text-[11px] text-neutral-500 tabular-nums">· ${esc(fmtFn(peakPoint.value))}</span>
                  </div>
                ` : ''}
                ${avgVal > 0 ? `
                  <div class="flex items-baseline gap-1.5">
                    <span class="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Avg</span>
                    <span class="text-sm text-white font-semibold tabular-nums">${esc(fmtFn(avgVal))}</span>
                    <span class="text-[11px] text-neutral-500">/ day</span>
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="px-5 pb-4">
              ${buildSmoothSvgAreaChart(points, prevPoints, mMeta.stroke, fmtFn)}
            </div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            ${renderKpiCard({ metricKey: 'messages', label: 'Total Messages', value: fmtNum(T.messages?.current), delta: T.messages, sparkline: A.messages, iconSvg: SVGS.messageSquare, iconColor: 'text-blue-400', accent: '#3b82f6', clickable: true, isActive: heroMetric === 'messages' })}
            ${renderKpiCard({ metricKey: 'activeUsers', label: 'Active Users', value: fmtNum(T.activeUsers?.current), delta: T.activeUsers, sparkline: A.activeUsers, iconSvg: SVGS.userCheck, iconColor: 'text-violet-400', accent: '#8b5cf6', clickable: true, isActive: heroMetric === 'activeUsers' })}
            ${renderKpiCard({ metricKey: 'voiceMinutes', label: 'Voice Time', value: fmtVoice(T.voiceMinutes?.current), delta: T.voiceMinutes, sparkline: A.voiceMinutes, iconSvg: SVGS.mic, iconColor: 'text-amber-400', accent: '#f59e0b', formatDelta: (v) => `${Math.round(v)}m`, clickable: true, isActive: heroMetric === 'voiceMinutes' })}
            ${renderKpiCard({ metricKey: 'members', label: 'Members', value: fmtNum(T.members?.current), delta: T.members, sparkline: A.members, iconSvg: SVGS.users, iconColor: 'text-emerald-400', accent: '#10b981', clickable: true, isActive: heroMetric === 'members' })}
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            ${renderTableCard({
              title: 'Top Message Channels',
              subtitle: `Last ${timeRange} days · ${(P.topMessageChannels?.total || 0).toLocaleString()} messages`,
              columns: { label: 'Channel', count: 'Messages', share: '% of Activity', change: 'Change' },
              rows: topMsgRows,
              ringColor: 'text-emerald-500',
              emptyTitle: 'No channel activity yet',
              emptyHint: 'Stats build up as messages come in.'
            })}
            ${renderTableCard({
              title: 'Top Reaction Channels',
              subtitle: `Last ${timeRange} days · ${(P.topReactionChannels?.total || 0).toLocaleString()} total`,
              columns: { label: 'Item', count: 'Reactions', share: '% of Top 10', change: 'Change' },
              rows: topReactChRows,
              ringColor: 'text-pink-400',
              emptyTitle: 'No reactions tracked yet',
              emptyHint: 'Reaction tracking just started - channels with reactions will appear here.'
            })}
          </div>
        </section>
      `;
    }

    if (activeSection === 'people') {
      return `
        <section id="section-people" class="space-y-4">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            ${renderTableCard({
              title: 'Top Communicators',
              subtitle: `Last ${timeRange} days · ${(P.topCommunicators?.total || 0).toLocaleString()} total`,
              columns: { label: 'Item', count: 'Messages', share: '% of Top 10', change: 'Change' },
              rows: decorateRows(P.topCommunicators, 'user'),
              ringColor: 'text-violet-400',
              emptyTitle: 'No data yet',
              emptyHint: 'Per-user message tracking just started - data builds up over the next few days.'
            })}
            ${renderTableCard({
              title: 'Top Voice Users',
              subtitle: 'Lifetime voice time',
              columns: { label: 'Item', count: 'Voice Time', share: '% of Top 10', change: 'Change' },
              rows: decorateRows(P.topVoiceUsers, 'user'),
              ringColor: 'text-amber-400',
              formatCount: fmtVoice,
              emptyTitle: 'No voice activity',
              emptyHint: "Once members spend time in voice channels, they'll show up here."
            })}
            ${renderTableCard({
              title: 'Most Reacted To',
              subtitle: `Last ${timeRange} days · ${(P.mostReactedTo?.total || 0).toLocaleString()} total`,
              columns: { label: 'Item', count: 'Reactions', share: '% of Top 10', change: 'Change' },
              rows: decorateRows(P.mostReactedTo, 'user'),
              ringColor: 'text-pink-400',
              emptyTitle: 'No reactions tracked yet',
              emptyHint: 'Reaction tracking just started - data builds up as members react to messages.'
            })}
            ${renderTableCard({
              title: 'At-Risk Members',
              subtitle: `Active before, quiet in the last ${timeRange} days`,
              columns: { label: 'Item', count: 'Prev Msgs', share: '% of Group', change: 'Change' },
              rows: decorateRows(P.atRiskMembers, 'user'),
              ringColor: 'text-red-400',
              inverseChange: true,
              emptyTitle: 'No at-risk members',
              emptyHint: 'Builds up over time - needs at least a few weeks of message history per user.'
            })}
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            ${renderTableCard({
              title: 'Top Inviters',
              subtitle: `Last ${timeRange} days · ${(P.topInviters?.total || 0).toLocaleString()} total`,
              action: { label: 'Invite Tracker', href: `/dashboard/${guildId}/invites` },
              columns: { label: 'Item', count: 'Joins', share: '% of Top 10', change: 'Change' },
              rows: decorateRows(P.topInviters, 'user'),
              ringColor: 'text-emerald-400',
              emptyTitle: 'No tracked invites',
              emptyHint: 'Invite Tracker needs to be set up first.'
            })}
            ${renderTableCard({
              title: 'Most Mentioned',
              subtitle: `Last ${timeRange} days · ${(P.mostMentioned?.total || 0).toLocaleString()} total`,
              columns: { label: 'Item', count: 'Mentions', share: '% of Top 10', change: 'Change' },
              rows: decorateRows(P.mostMentioned, 'user'),
              ringColor: 'text-blue-400',
              emptyTitle: 'No mentions tracked yet',
              emptyHint: 'Mention tracking just started - data builds up as members ping each other.'
            })}
          </div>
        </section>
      `;
    }

    if (activeSection === 'activity') {
      const live48 = analyticsData.liveMessages?.['48h'] || { total: 0, data: [] };
      const live60 = analyticsData.liveMessages?.['60min'] || { total: 0, data: [] };
      return `
        <section id="section-activity" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${renderLiveBarCard({ title: 'Messages · Last 48 hours', total: live48.total, data: live48.data, barInterval: 7, chartId: '48h' })}
            ${renderLiveBarCard({ title: 'Messages · Last 60 minutes', total: live60.total, data: live60.data, barInterval: 9, chartId: '60m' })}
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            ${renderTableCard({
              title: 'Top Active Channels',
              subtitle: `Last ${timeRange} days · ${(P.topMessageChannels?.total || 0).toLocaleString()} messages`,
              columns: { label: 'Channel', count: 'Messages', share: '% of Activity', change: 'Change' },
              rows: decorateRows(P.topMessageChannels, 'channel'),
              ringColor: 'text-emerald-500',
              emptyTitle: 'No channel activity yet',
              emptyHint: 'Stats build up as messages come in.'
            })}
            ${renderTableCard({
              title: 'Top Voice Channels',
              subtitle: `Last ${timeRange} days · ${(P.topVoiceChannels?.total || 0).toLocaleString()} total`,
              columns: { label: 'Item', count: 'Voice Time', share: '% of Top 10', change: 'Change' },
              rows: decorateRows(P.topVoiceChannels, 'channel'),
              ringColor: 'text-amber-400',
              formatCount: fmtVoice,
              emptyTitle: 'No voice activity yet',
              emptyHint: 'Per-channel voice tracking just started - minutes accrue as members hang out in voice.'
            })}
          </div>
          ${renderHeatmapCard(analyticsData.heatmap, timeRange)}
          ${renderTableCard({
            title: 'Surging Channels',
            subtitle: `Biggest % growth vs previous ${timeRange} days`,
            columns: { label: 'Item', count: 'Messages', share: '% of Top 10', change: 'Change' },
            rows: decorateRows(P.surgingChannels, 'channel'),
            ringColor: 'text-emerald-400',
            emptyTitle: 'No surging channels',
            emptyHint: 'Channels need at least 2 windows of data to compare growth.'
          })}
        </section>
      `;
    }

    if (activeSection === 'moderation') {
      return `
        <section id="section-moderation" class="space-y-4">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            ${renderKpiCard({ label: 'Mod Actions', value: fmtNum(T.modActions?.current), delta: T.modActions, sparkline: A.modActions, iconSvg: SVGS.shieldAlert, iconColor: 'text-red-400', accent: '#ef4444' })}
            ${renderKpiCard({ label: 'Open Tickets', value: fmtNum(T.openTickets?.current), delta: T.openTickets, sparkline: A.openTickets, iconSvg: SVGS.ticket, iconColor: 'text-amber-400', accent: '#f59e0b' })}
            ${renderKpiCard({ label: 'Resolved', value: fmtNum(T.closedTickets?.current), delta: T.closedTickets, sparkline: A.closedTickets, iconSvg: SVGS.checkCircle, iconColor: 'text-emerald-400', accent: '#10b981' })}
            ${renderKpiCard({ label: 'Avg Resolve Time', value: T.avgResolveTime || '-', iconSvg: SVGS.clock, iconColor: 'text-neutral-400' })}
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            ${renderTableCard({
              title: 'Top Moderated Users',
              subtitle: 'Repeat offenders worth a closer look',
              action: { label: 'Moderation', href: `/dashboard/${guildId}/moderation` },
              columns: { label: 'Item', count: 'Actions', share: '% of Top 10', change: 'Change' },
              rows: decorateRows(P.topModeratedUsers, 'user'),
              ringColor: 'text-red-400',
              inverseChange: true,
              emptyTitle: 'No mod actions',
              emptyHint: 'Once your mod team starts handling cases, repeat targets will surface here.'
            })}
            ${renderTableCard({
              title: 'Mod Actions by Channel',
              subtitle: 'Where problems concentrate',
              columns: { label: 'Item', count: 'Actions', share: '% of Top 10', change: 'Change' },
              rows: decorateRows(P.modActionsByChannel, 'channel'),
              ringColor: 'text-red-400',
              inverseChange: true,
              emptyTitle: 'No channel data',
              emptyHint: 'Per-channel mod action tracking just started - populates as new actions are taken.'
            })}
            ${renderTableCard({
              title: 'Auto-Mod Trips by Filter',
              subtitle: 'Which filters fire most',
              action: { label: 'Auto-Mod', href: `/dashboard/${guildId}/moderation` },
              columns: { label: 'Item', count: 'Trips', share: '% of Top 10', change: 'Change' },
              rows: decorateRows(P.autoModTrips, 'raw'),
              ringColor: 'text-amber-400',
              inverseChange: true,
              emptyTitle: 'No filter trips',
              emptyHint: "Auto-mod is either disabled or hasn't caught anything in this window."
            })}
            ${renderTableCard({
              title: 'Tickets by Category',
              subtitle: `Last ${timeRange} days · ${(P.ticketsByCategory?.total || 0).toLocaleString()} total`,
              action: { label: 'Tickets', href: `/dashboard/${guildId}/tickets` },
              columns: { label: 'Item', count: 'Tickets', share: '% of Top 10', change: 'Change' },
              rows: decorateRows(P.ticketsByCategory, 'raw'),
              ringColor: 'text-blue-400',
              emptyTitle: 'No tickets opened',
              emptyHint: "Once support tickets are created, they'll be grouped by category here."
            })}
          </div>
        </section>
      `;
    }

    if (activeSection === 'safety') {
      const safetyRows = (P.safetyActivity?.rows || []).map(r => ({
        ...r,
        labelHtml: `
          <span class="inline-flex items-center gap-1 min-w-0 px-1.5 py-0.5 border rounded w-fit max-w-full bg-amber-500/15 border-amber-500/25 text-amber-200">
            ${SVGS.alertTriangle}
            <span class="text-[11px] font-medium truncate">${esc(r.name)}</span>
          </span>
        `
      }));
      const threatHourRows = (P.threatsByHour?.rows || []).map(r => {
        const h = parseInt(r.id, 10) || 0;
        const dt = new Date();
        dt.setUTCHours(h, 0, 0, 0);
        const formattedHour = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: true }).format(dt);
        return {
          ...r,
          labelHtml: `
            <span class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-500/15 border border-orange-500/25 rounded">
              <span class="text-orange-300">${SVGS.clock}</span>
              <span class="text-[11px] text-orange-200 font-mono">${esc(formattedHour)}</span>
            </span>
          `
        };
      });

      return `
        <section id="section-safety" class="space-y-4">
          ${renderTableCard({
            title: 'Safety Activity',
            subtitle: `Last ${timeRange} days · ${(P.safetyActivity?.total || 0).toLocaleString()} events`,
            action: { label: 'Threat Log', href: `/dashboard/${guildId}/security` },
            columns: { label: 'Event Type', count: 'Count', share: '% of Total', change: 'Change' },
            rows: safetyRows,
            ringColor: 'text-orange-400',
            inverseChange: true,
            emptyTitle: 'All clear',
            emptyHint: 'No threats detected in this window.'
          })}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            ${renderTableCard({
              title: 'Threats by Hour',
              subtitle: 'When raids and attacks happen (your local time)',
              action: { label: 'Threat Log', href: `/dashboard/${guildId}/security` },
              columns: { label: 'Item', count: 'Events', share: '% of Total', change: 'Change' },
              rows: threatHourRows,
              ringColor: 'text-orange-400',
              inverseChange: true,
              emptyTitle: 'No threats detected',
              emptyHint: 'When raids or anti-nuke trips occur, the times they happen will surface here.'
            })}
            <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
              <div class="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm text-white font-semibold">Suspicious Accounts</p>
                  </div>
                  <p class="text-[11px] text-neutral-500 mt-0.5">Quarantined accounts awaiting your decision</p>
                </div>
                <a href="/dashboard/${guildId}/security" class="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors">
                  Security
                  ${SVGS.arrowRight}
                </a>
              </div>
              <div class="flex-1 px-2 pb-3">
                <div class="h-[160px] flex flex-col items-center justify-center text-center">
                  <div class="text-emerald-500/60 mb-2">${SVGS.checkCircle}</div>
                  <p class="text-sm text-neutral-300 font-medium">No pending review</p>
                  <p class="text-[11px] text-neutral-600 mt-1">All flagged accounts have been handled.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
    }

    if (activeSection === 'growth') {
      const g = analyticsData.growth || {};
      const srcData = g.sources || { summaries: { totalJoins: { current: 0 }, totalLeaves: { current: 0 }, retained: { current: 0 }, sourceCount: 0 }, topSources: [] };
      const funnel = g.retentionFunnel || { joined: 0, firstMessage: 0, retained7d: 0, retained30d: 0 };
      const cohortData = g.cohortRetention || { weeks: 6, cohorts: [] };

      const funnelSteps = [
        { key: 'joined', label: 'Joined', hint: 'Tracked invites in the window', tone: 'from-blue-500/30 to-blue-500/10 border-blue-500/30', textCls: 'text-blue-200' },
        { key: 'firstMessage', label: '1st Message', hint: 'Posted within 24h of joining', tone: 'from-violet-500/30 to-violet-500/10 border-violet-500/30', textCls: 'text-violet-200' },
        { key: 'retained7d', label: 'Retained 7d', hint: 'Active during days 1-7', tone: 'from-emerald-500/30 to-emerald-500/10 border-emerald-500/30', textCls: 'text-emerald-200' },
        { key: 'retained30d', label: 'Retained 30d', hint: 'Active during days 8-30', tone: 'from-emerald-500/45 to-emerald-500/15 border-emerald-500/45', textCls: 'text-emerald-100' }
      ];
      const maxFunnel = Math.max(funnel.joined || 0, 1);

      const cellColor = (val) => {
        if (val === null || val === undefined) return 'bg-neutral-900 text-neutral-700';
        if (val === 0) return 'bg-neutral-800 text-neutral-600';
        if (val < 20) return 'bg-emerald-500/10 text-emerald-300';
        if (val < 40) return 'bg-emerald-500/20 text-emerald-200';
        if (val < 60) return 'bg-emerald-500/35 text-emerald-100';
        if (val < 80) return 'bg-emerald-500/50 text-white';
        return 'bg-emerald-500/70 text-white';
      };

      return `
        <section id="section-growth" class="space-y-4">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Top Sources -->
            <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
              <div class="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm text-white font-semibold">Top Sources</p>
                  <p class="text-[11px] text-neutral-500 mt-0.5">Last ${timeRange} days${srcData.topSources?.length ? ` · ${srcData.topSources.length} sources` : ''}</p>
                </div>
              </div>
              <div class="flex-1 px-4 pb-4">
                ${(srcData.summaries?.totalJoins?.current > 0 || srcData.summaries?.totalLeaves?.current > 0) ? `
                  <div class="flex gap-4 mb-3 pb-3 border-b border-white/[0.04]">
                    <div>
                      <p class="text-base font-bold text-emerald-400 tabular-nums leading-none">${srcData.summaries.totalJoins.current}</p>
                      <p class="text-[10px] text-neutral-500 mt-1">Joins</p>
                    </div>
                    <div>
                      <p class="text-base font-bold text-red-400 tabular-nums leading-none">${srcData.summaries.totalLeaves.current}</p>
                      <p class="text-[10px] text-neutral-500 mt-1">Leaves</p>
                    </div>
                    <div>
                      <p class="text-base font-bold text-white tabular-nums leading-none">${srcData.summaries.retained.current}</p>
                      <p class="text-[10px] text-neutral-500 mt-1">Retained</p>
                    </div>
                  </div>
                ` : ''}
                ${srcData.topSources && srcData.topSources.length > 0 ? `
                  <div class="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                    ${srcData.topSources.map((src, idx) => {
                      const topJ = srcData.topSources[0]?.joins || 1;
                      const pct = Math.round((src.joins / topJ) * 100);
                      const col = SOURCE_COLORS[idx % SOURCE_COLORS.length];
                      return `
                        <div>
                          <div class="flex items-center gap-2.5 mb-1">
                            <div class="w-2 h-2 rounded-full flex-shrink-0" style="background-color:${col}"></div>
                            <span class="text-sm text-neutral-300 truncate flex-1">${esc(src.name)}</span>
                            <span class="text-xs font-medium text-neutral-400 tabular-nums">${src.joins}</span>
                          </div>
                          <div class="ml-[18px]">
                            <div class="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                              <div class="h-full rounded-full transition-all duration-500" style="width:${pct}%;background-color:${col};opacity:0.5"></div>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                ` : `
                  <div class="relative flex-1 min-h-[180px] flex flex-col items-center justify-center text-center">
                    <p class="text-sm font-medium text-white">Invite Source Tracker</p>
                    <p class="text-xs text-neutral-400 mt-1 max-w-xs">Track which invite links bring the most engaged members to your server.</p>
                    <a href="/dashboard/${guildId}/invites" class="mt-3 px-4 py-2 rounded-lg bg-white hover:bg-neutral-100 text-black text-xs font-semibold transition-colors">Configure Invite Tracker</a>
                  </div>
                `}
              </div>
            </div>

            ${renderTableCard({
              title: 'Leaves by Source',
              subtitle: 'Inviters whose recruits left (sticky-vs-churner signal)',
              action: { label: 'Invite Tracker', href: `/dashboard/${guildId}/invites` },
              columns: { label: 'Item', count: 'Leaves', share: '% of Top 10', change: 'Change' },
              rows: decorateRows(P.leavesBySource, 'user'),
              ringColor: 'text-red-400',
              inverseChange: true,
              emptyTitle: 'No tracked leaves',
              emptyHint: 'Invite Tracker needs to be enabled, and members need to leave for data to populate.'
            })}
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Retention Funnel -->
            <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
              <div class="px-4 pt-4 pb-2">
                <p class="text-sm text-white font-semibold">Retention Funnel</p>
                <p class="text-[11px] text-neutral-500 mt-0.5">Joins in last ${Math.max(timeRange, 30)} days · how many became active members</p>
              </div>
              <div class="flex-1 px-4 pb-4">
                ${funnel.joined > 0 ? `
                  <div>
                    ${funnelSteps.map((st, idx) => {
                      const val = Number(funnel[st.key] || 0);
                      const prevVal = idx > 0 ? Number(funnel[funnelSteps[idx - 1].key] || 0) : null;
                      const conv = (prevVal !== null && prevVal > 0) ? Math.round((val / prevVal) * 100) : null;
                      const widthPct = Math.max(8, Math.round((val / maxFunnel) * 100));
                      return `
                        <div>
                          ${conv !== null ? `
                            <div class="flex items-center gap-2 ml-3 my-1.5">
                              <span class="text-emerald-400">${SVGS.arrowDown}</span>
                              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold tabular-nums bg-emerald-500/10 border-emerald-500/25 text-emerald-400">${conv}%</span>
                              <span class="text-[10px] text-neutral-600">${val < prevVal ? `${prevVal - val} dropped off` : `kept ${val}`}</span>
                            </div>
                          ` : ''}
                          <div class="flex justify-center">
                            <div class="bg-gradient-to-r ${st.tone} border rounded-xl px-4 py-3 transition-all duration-500" style="width:${widthPct}%;min-width:180px">
                              <div class="flex items-center justify-between gap-3">
                                <div class="min-w-0">
                                  <p class="text-sm font-semibold ${st.textCls} leading-none">${st.label}</p>
                                  <p class="text-[10px] text-neutral-500 mt-1 truncate">${st.hint}</p>
                                </div>
                                <span class="text-2xl font-bold tabular-nums leading-none flex-shrink-0 ${st.textCls}">${val.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                    <p class="text-[10px] text-neutral-600 mt-4 text-center">Each step is a subset of the one above. Drop-off arrows show conversion %.</p>
                  </div>
                ` : `
                  <div class="h-[200px] flex flex-col items-center justify-center text-center">
                    <div class="text-neutral-700 mb-2">${SVGS.users}</div>
                    <p class="text-sm text-neutral-300 font-medium">No tracked joins</p>
                    <p class="text-[11px] text-neutral-600 mt-1">Invite Tracker needs to be enabled to see funnel data.</p>
                  </div>
                `}
              </div>
            </div>

            <!-- Cohort Retention -->
            <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] flex flex-col">
              <div class="px-4 pt-4 pb-2">
                <p class="text-sm text-white font-semibold">Cohort Retention</p>
                <p class="text-[11px] text-neutral-500 mt-0.5">Weekly cohorts of joiners · % still active each week</p>
              </div>
              <div class="flex-1 px-4 pb-4 overflow-x-auto">
                ${cohortData.cohorts && cohortData.cohorts.length > 0 ? `
                  <table class="w-full text-[11px]">
                    <thead>
                      <tr class="text-neutral-500">
                        <th class="text-left font-semibold py-1 pr-2">Cohort</th>
                        <th class="text-right font-semibold py-1 px-2">Size</th>
                        ${Array.from({ length: cohortData.weeks || 6 }, (_, w) => `<th class="text-center font-semibold py-1 px-1 min-w-[44px]">W${w}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody>
                      ${cohortData.cohorts.map(c => `
                        <tr class="border-t border-neutral-800/40">
                          <td class="py-1 pr-2 text-neutral-400 font-medium whitespace-nowrap">${esc(c.label || c.weekStart)}</td>
                          <td class="py-1 px-2 text-neutral-500 text-right tabular-nums">${c.size}</td>
                          ${(c.retention || []).map(val => `
                            <td class="px-0.5 py-0.5">
                              <div class="text-center py-1.5 rounded ${cellColor(val)} tabular-nums font-medium text-[11px]">
                                ${val === null || val === undefined ? '-' : `${Math.round(val)}%`}
                              </div>
                            </td>
                          `).join('')}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : `
                  <div class="h-[180px] flex flex-col items-center justify-center text-center">
                    <div class="text-neutral-700 mb-2">${SVGS.trendingUp}</div>
                    <p class="text-sm text-neutral-300 font-medium">No cohort data yet</p>
                    <p class="text-[11px] text-neutral-600 mt-1">Needs at least a week of tracked joins + activity to populate.</p>
                  </div>
                `}
              </div>
            </div>
          </div>
        </section>
      `;
    }

    return '';
  }

  function renderFullPage() {
    container.innerHTML = `
      <div class="pb-12">
        <!-- Sticky Analytics Section Nav + Time Range Selector -->
        <div class="sticky top-16 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-900 flex items-center gap-4">
          <nav class="flex gap-0.5 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-700 -mb-px flex-1 min-w-0" aria-label="Analytics sections">
            ${SECTIONS.map(sec => {
              const isAct = activeSection === sec.id;
              return `
                <button type="button" data-analytics-sec="${sec.id}" class="group relative flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors whitespace-nowrap cursor-pointer ${isAct ? 'text-white' : 'text-neutral-500 hover:text-neutral-200'}">
                  <span class="transition-colors ${isAct ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'}">${sec.icon}</span>
                  ${esc(sec.label)}
                  ${isAct ? `<span class="absolute bottom-0 left-2 right-2 h-[2px] bg-white rounded-t-sm"></span>` : ''}
                </button>
              `;
            }).join('')}
          </nav>
          <div class="flex-shrink-0 py-1.5">
            <div class="flex items-center gap-1 p-1 rounded-xl bg-neutral-800/50 border border-neutral-800">
              ${[
                { value: 7, label: '7D' },
                { value: 14, label: '14D' },
                { value: 30, label: '30D' },
                { value: 90, label: '90D' }
              ].map(rng => {
                const isAct = timeRange === rng.value;
                return `
                  <button type="button" data-analytics-days="${rng.value}" class="px-3 py-2.5 sm:py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 cursor-pointer ${isAct ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}">
                    ${rng.label}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div id="analytics-body-wrap" class="space-y-10 pt-6">
          ${renderSectionContent()}
        </div>

        <div id="heatmap-floating-tooltip" class="hidden fixed z-50 pointer-events-none bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 shadow-xl"></div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // Section tabs
    container.querySelectorAll('[data-analytics-sec]').forEach(btn => {
      btn.onclick = () => {
        activeSection = btn.getAttribute('data-analytics-sec') || 'engagement';
        renderFullPage();
      };
    });

    // Time range buttons
    container.querySelectorAll('[data-analytics-days]').forEach(btn => {
      btn.onclick = async () => {
        const val = parseInt(btn.getAttribute('data-analytics-days'), 10);
        if (!val || val === timeRange) return;
        timeRange = val;
        isLoading = true;
        renderFullPage();
        await loadAnalyticsData();
      };
    });

    // Hero metric switcher buttons & KPI cards
    container.querySelectorAll('[data-hero-metric], [data-kpi-metric]').forEach(btn => {
      btn.onclick = () => {
        const m = btn.getAttribute('data-hero-metric') || btn.getAttribute('data-kpi-metric');
        if (m && HERO_METRICS[m]) {
          heroMetric = m;
          renderFullPage();
        }
      };
    });

    // Hero chart hover interaction
    const heroWrap = document.getElementById('analytics-hero-chart-wrap');
    if (heroWrap) {
      const hoverLine = document.getElementById('hero-hover-line');
      const hoverDot = document.getElementById('hero-hover-dot');
      const hoverTip = document.getElementById('hero-hover-tooltip');
      heroWrap.querySelectorAll('.hero-hover-rect').forEach(rect => {
        rect.addEventListener('mouseenter', () => {
          const x = parseFloat(rect.getAttribute('data-x'));
          const y = parseFloat(rect.getAttribute('data-y'));
          const lbl = rect.getAttribute('data-label') || '';
          const val = rect.getAttribute('data-val') || '0';
          if (hoverLine) {
            hoverLine.setAttribute('x1', x);
            hoverLine.setAttribute('x2', x);
            hoverLine.classList.remove('hidden');
          }
          if (hoverDot) {
            hoverDot.setAttribute('cx', x);
            hoverDot.setAttribute('cy', y);
            hoverDot.classList.remove('hidden');
          }
          if (hoverTip) {
            hoverTip.innerHTML = `
              <p class="text-[11px] text-neutral-400 mb-0.5">${esc(lbl)}</p>
              <p class="text-sm text-white font-semibold tabular-nums">${esc(val)}</p>
            `;
            hoverTip.style.left = `${Math.min(82, Math.max(8, (x / 720) * 100))}%`;
            hoverTip.classList.remove('hidden');
          }
        });
        rect.addEventListener('mouseleave', () => {
          if (hoverLine) hoverLine.classList.add('hidden');
          if (hoverDot) hoverDot.classList.add('hidden');
          if (hoverTip) hoverTip.classList.add('hidden');
        });
      });
    }

    // Live bar chart hover interaction
    container.querySelectorAll('[data-live-chart]').forEach(wrap => {
      const tip = wrap.querySelector('.live-bar-tooltip');
      wrap.querySelectorAll('.live-bar-item').forEach(item => {
        const barRect = item.querySelector('.live-bar-rect');
        item.addEventListener('mouseenter', () => {
          if (barRect) barRect.setAttribute('fill', '#86efac');
          if (tip) {
            const lbl = item.getAttribute('data-label') || '';
            const val = Number(item.getAttribute('data-val') || 0).toLocaleString();
            tip.innerHTML = `
              <p class="text-[11px] text-neutral-400 mb-0.5">${esc(lbl)}</p>
              <div class="flex items-center gap-2 text-xs">
                <span class="text-neutral-400">Messages:</span>
                <span class="text-white font-semibold tabular-nums">${esc(val)}</span>
              </div>
            `;
            tip.style.right = '12px';
            tip.classList.remove('hidden');
          }
        });
        item.addEventListener('mouseleave', () => {
          if (barRect) barRect.setAttribute('fill', '#22c55e');
          if (tip) tip.classList.add('hidden');
        });
      });
    });

    // Heatmap cell hover tooltip
    const heatTip = document.getElementById('heatmap-floating-tooltip');
    container.querySelectorAll('.heatmap-cell').forEach(cell => {
      const showTip = (e) => {
        if (!heatTip) return;
        const val = Number(cell.getAttribute('data-val') || 0).toLocaleString();
        const day = cell.getAttribute('data-day') || '';
        const hr = cell.getAttribute('data-hour') || '';
        heatTip.innerHTML = `
          <p class="text-[10px] text-neutral-400 leading-none">${esc(day)} ${esc(hr)} · Messages</p>
          <p class="text-sm text-white font-semibold tabular-nums leading-none mt-1">${esc(val)}</p>
        `;
        heatTip.style.left = `${Math.min(e.clientX + 12, window.innerWidth - 140)}px`;
        heatTip.style.top = `${e.clientY + 12}px`;
        heatTip.classList.remove('hidden');
      };
      cell.addEventListener('mouseenter', showTip);
      cell.addEventListener('mousemove', showTip);
      cell.addEventListener('mouseleave', () => {
        if (heatTip) heatTip.classList.add('hidden');
      });
    });

    // Click-to-copy entity IDs (@user / #channel pills)
    container.querySelectorAll('[data-copy-entity]').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-copy-entity');
        if (!id) return;
        try {
          await navigator.clipboard.writeText(id);
          const origHtml = btn.innerHTML;
          const origClass = btn.className;
          btn.className = 'inline-flex items-center gap-1 min-w-0 px-1.5 py-0.5 rounded w-fit max-w-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-200';
          btn.innerHTML = `${SVGS.check}<span class="text-[11px] font-medium">Copied ID</span>`;
          setTimeout(() => {
            btn.className = origClass;
            btn.innerHTML = origHtml;
          }, 1500);
        } catch (_) {}
      };
    });
  }

  async function loadAnalyticsData() {
    try {
      analyticsData = await API.getGuildAnalytics(guildId, timeRange);
    } catch (err) {
      console.warn('[Analytics] Failed to load:', err);
    } finally {
      isLoading = false;
      renderFullPage();
    }
  }

  renderFullPage();
  await loadAnalyticsData();
};

DashboardTabs.Leaderboard = async function(container, guildId) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">Server Leaderboard</h1>
          <p class="text-xs text-neutral-400 mt-1">Top active chatters ranked by level and experience.</p>
        </div>
        <a href="/leaderboard/${guildId}" target="_blank" class="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
          ${icon('external-link', 14)} Public Leaderboard Link
        </a>
      </div>
      <div id="dash-lb-list" class="flex flex-col gap-2">
        <div class="text-center py-12 text-neutral-500 text-sm">Loading leaderboard rankings...</div>
      </div>
    </div>
  `;

  try {
    const data = await API.getLeaderboard(guildId);
    const list = Array.isArray(data) ? data : (data?.users || []);
    const lbContainer = document.getElementById('dash-lb-list');
    if (!lbContainer) return;

    if (list.length === 0) {
      lbContainer.innerHTML = `<div class="p-8 text-center text-neutral-500 text-xs rounded-2xl bg-neutral-900 border border-neutral-800">No member activity recorded yet. Chat in text channels to earn XP!</div>`;
      return;
    }

    lbContainer.innerHTML = list.map((u, i) => `
      <div class="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4">
        <div class="flex items-center gap-4 min-w-0">
          <span class="text-sm font-bold w-6 text-center ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-neutral-300' : i === 2 ? 'text-amber-600' : 'text-neutral-500'}">#${i + 1}</span>
          <img src="${u.avatar || '/img/logo.png'}" class="w-10 h-10 rounded-full shrink-0" alt="${u.name || 'User'}">
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-bold text-white truncate">${u.name || u.user_id}</span>
            <span class="text-[11px] text-neutral-500">XP: ${u.xp?.toLocaleString() || 0}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs">Level ${u.level || 0}</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="p-8 text-red-400 text-center">Error: ${err.message}</div>`;
  }
};
