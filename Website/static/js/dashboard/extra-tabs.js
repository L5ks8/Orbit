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
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-4xl mx-auto animate-fade-in">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">General Server Settings</h1>
          <p class="text-xs text-neutral-400 mt-1">Prefix, manager roles, and embed appearance settings.</p>
        </div>
        <button type="button" id="save-settings-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-95">Save Changes</button>
      </div>

      <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-5">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-neutral-300">Command Prefix</label>
          <input type="text" id="setting-prefix-inp" value="!" class="w-32 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
        </div>

        <div class="flex flex-col gap-1.5 pt-3 border-t border-neutral-800">
          <label class="text-xs font-semibold text-neutral-300">Bot Response Style</label>
          <span class="text-[11px] text-neutral-500">Choose between modern Discord Components V2 cards or standard embeds.</span>
          <select id="setting-style-sel" class="w-64 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
            <option value="v2">Discord Components V2 (Recommended)</option>
            <option value="normal">Standard Discord Embeds</option>
          </select>
        </div>
      </div>
    </div>
  `;

  try {
    const data = await API.getConfig(guildId);
    const s = data.config?.Settings || data.Settings || {};
    if (s.prefix) document.getElementById('setting-prefix-inp').value = s.prefix;
    if (s.embed_style) document.getElementById('setting-style-sel').value = s.embed_style;

    document.getElementById('save-settings-btn').onclick = async () => {
      const btn = document.getElementById('save-settings-btn');
      btn.textContent = 'Saving...';
      try {
        await API.saveConfig(guildId, {
          Settings: {
            prefix: document.getElementById('setting-prefix-inp').value,
            embed_style: document.getElementById('setting-style-sel').value
          }
        });
        Toast.success('Server settings saved!');
      } catch (err) {
        Toast.error('Failed to save: ' + err.message);
      } finally {
        btn.textContent = 'Save Changes';
      }
    };
  } catch (_) {}
};

DashboardTabs.Analytics = async function(container, guildId) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">Server Analytics</h1>
          <p class="text-xs text-neutral-400 mt-1">Growth curves, join metrics, and activity tracking.</p>
        </div>
      </div>
      <div class="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 text-xs">
        Analytics history is being collected from live gateway events. View growth summaries directly in the Overview tab.
      </div>
    </div>
  `;
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
