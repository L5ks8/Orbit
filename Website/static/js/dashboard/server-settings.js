/**
 * Orbit Dashboard - Server Settings Tab (/dashboard/:guildId/settings & /dashboard/:guildId/server-settings)
 */

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
        <div class="space-y-6">

          <!-- 1. Dashboard Access Card -->
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
                        <div class="orbit-searchbar-header sticky top-0 z-20 p-2 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800/80 shrink-0">
                          <div class="relative w-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                            <input type="text" id="access-target-search" placeholder="Suchen..." class="orbit-searchbar-input w-full pl-9 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off">
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

          <!-- 2. Moderation Immunity Card (Immunity & Bypasses) -->
          <div class="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
            <div class="px-4 sm:px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check text-indigo-400 shrink-0"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-semibold text-white">Moderation Immunity</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-medium">Bypass</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="px-4 sm:px-5 py-5 space-y-6">

              <!-- Immune Roles -->
              <div>
                <label class="text-sm font-medium text-neutral-200 block mb-1">Immune Roles</label>
                <p class="text-xs text-neutral-400 mb-3">Members with any of these roles are completely immune to bans, kicks, mutes, timeouts, and automod actions.</p>
                
                <div class="relative w-full" id="immune-roles-wrap">
                  <button type="button" id="immune-roles-btn" class="w-full flex items-center justify-between gap-2 min-h-[44px] px-3 py-1.5 bg-neutral-800 border rounded-xl text-left transition-all duration-200 border-neutral-700 hover:border-neutral-600 cursor-pointer">
                    <div class="flex-1 flex flex-wrap gap-1.5 py-0.5" id="immune-roles-chips">
                      <span class="text-neutral-500 text-sm py-0.5">Select immune roles...</span>
                    </div>
                    <svg id="immune-roles-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down text-neutral-400 flex-shrink-0 transition-transform duration-200"><path d="m6 9 6 6 6-6"></path></svg>
                  </button>

                  <!-- Roles dropdown menu -->
                  <div id="immune-roles-dropdown" class="hidden absolute left-0 right-0 mt-1.5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-40 overflow-hidden max-h-60 flex flex-col">
                    <div class="p-2 border-b border-neutral-800/80 sticky top-0 bg-neutral-900/95 backdrop-blur-md shrink-0">
                      <div class="relative w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                        <input type="text" id="immune-roles-search" placeholder="Search roles..." class="w-full pl-9 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500" autocomplete="off">
                      </div>
                    </div>
                    <div id="immune-roles-options" class="overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin"></div>
                  </div>
                </div>
              </div>

              <!-- Immune Users -->
              <div class="pt-5 border-t border-neutral-800/60">
                <label class="text-sm font-medium text-neutral-200 block mb-1">Immune Users</label>
                <p class="text-xs text-neutral-400 mb-3">Users on this list are permanently immune to bans, kicks, mutes, timeouts, and automod actions.</p>

                <!-- Input group: User ID + Add ID button -->
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div class="relative flex-1 min-w-0">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <input 
                      type="text" 
                      id="immune-user-input" 
                      placeholder="Discord User ID eingeben (z. B. 123456789012345678)..." 
                      class="w-full pl-10 pr-4 h-10 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500/80 transition-colors"
                      autocomplete="off"
                    >
                  </div>
                  <button 
                    type="button" 
                    id="immune-user-add-btn" 
                    class="h-10 px-5 rounded-xl text-sm font-medium inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-plus"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
                    <span>Add ID</span>
                  </button>
                </div>

                <!-- Added Immune Users List underneath -->
                <div id="immune-users-container" class="mt-4">
                  <p class="text-xs text-neutral-500 py-3">No immune users added yet. Enter a Discord User ID above and click "Add ID".</p>
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

  let immuneRoles = [];
  let immuneUsers = [];

  // Elements for Dashboard Access
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

  // Elements for Immunity
  const immuneRolesBtn = document.getElementById('immune-roles-btn');
  const immuneRolesChips = document.getElementById('immune-roles-chips');
  const immuneRolesDropdown = document.getElementById('immune-roles-dropdown');
  const immuneRolesChevron = document.getElementById('immune-roles-chevron');
  const immuneRolesSearch = document.getElementById('immune-roles-search');
  const immuneRolesOptions = document.getElementById('immune-roles-options');

  const immuneUserInput = document.getElementById('immune-user-input');
  const immuneUserAddBtn = document.getElementById('immune-user-add-btn');
  const immuneUsersContainer = document.getElementById('immune-users-container');

  function updateTargetButton() {
    if (!selectedTarget) {
      targetDisplay.innerHTML = `<span class="text-neutral-500">Search people and roles</span>`;
      grantBtn.disabled = true;
    } else {
      const badge = selectedTarget.type === 'role'
        ? `<span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${esc(selectedTarget.color || '#99aab5')}"></span>`
        : `<img src="${esc(selectedTarget.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png')}" alt="" class="w-4 h-4 rounded-full object-cover flex-shrink-0" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">`;
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
              const colorHex = r.color && r.color !== '#000000' && r.color !== 0
                ? (typeof r.color === 'number' ? '#' + r.color.toString(16).padStart(6, '0') : r.color)
                : '#99aab5';
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
                <img src="${esc(m.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png')}" alt="" class="w-4 h-4 rounded-full object-cover flex-shrink-0" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
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
            : `<img src="${esc(item.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png')}" alt="" class="w-5 h-5 rounded-full object-cover flex-shrink-0" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">`;
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
        } catch (err) {
          Toast.error('Failed to update access: ' + err.message);
        }
      };
    });
  }

  // --- Immunity Logic (Roles & Users) ---
  async function persistImmunity() {
    await API.saveConfig(guildId, {
      settings: {
        immune_roles: immuneRoles,
        immune_users: immuneUsers
      }
    });
  }

  function renderImmuneRoleChips() {
    if (!immuneRoles.length) {
      immuneRolesChips.innerHTML = `<span class="text-neutral-500 text-sm py-0.5">Select immune roles...</span>`;
      return;
    }

    immuneRolesChips.innerHTML = immuneRoles.map(rid => {
      const r = roles.find(role => String(role.id) === String(rid));
      const roleName = r ? r.name : `Role ${rid}`;
      const colorHex = r && r.color && r.color !== '#000000' && r.color !== 0
        ? (typeof r.color === 'number' ? '#' + r.color.toString(16).padStart(6, '0') : r.color)
        : '#99aab5';
      return `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-neutral-200">
          <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${esc(colorHex)}"></span>
          <span class="truncate max-w-[130px] font-medium">${esc(roleName)}</span>
          <button type="button" data-remove-role-id="${esc(rid)}" class="text-neutral-400 hover:text-red-400 p-0.5 rounded cursor-pointer transition-colors" title="Remove role">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </span>
      `;
    }).join('');

    immuneRolesChips.querySelectorAll('[data-remove-role-id]').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const rid = btn.getAttribute('data-remove-role-id');
        immuneRoles = immuneRoles.filter(id => String(id) !== String(rid));
        renderImmuneRoleChips();
        renderImmuneRoleOptions(immuneRolesSearch.value);
        try {
          await persistImmunity();
        } catch (err) {
          Toast.error('Failed to save immune roles: ' + err.message);
        }
      };
    });
  }

  function renderImmuneRoleOptions(query = '') {
    const q = query.trim().toLowerCase();
    const filtered = roles.filter(r => r.name.toLowerCase().includes(q));

    if (!filtered.length) {
      immuneRolesOptions.innerHTML = `<div class="px-3 py-4 text-center text-xs text-neutral-500">No matching roles found</div>`;
      return;
    }

    immuneRolesOptions.innerHTML = filtered.map(r => {
      const isSelected = immuneRoles.includes(String(r.id));
      const colorHex = r.color && r.color !== '#000000' && r.color !== 0
        ? (typeof r.color === 'number' ? '#' + r.color.toString(16).padStart(6, '0') : r.color)
        : '#99aab5';
      return `
        <button 
          type="button" 
          data-role-id="${esc(r.id)}" 
          class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${isSelected ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'}"
        >
          <span class="flex items-center gap-2 truncate">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${esc(colorHex)}"></span>
            <span class="truncate">${esc(r.name)}</span>
          </span>
          ${isSelected ? `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check text-emerald-400 shrink-0"><path d="M20 6 9 17l-5-5"></path></svg>
          ` : ''}
        </button>
      `;
    }).join('');

    immuneRolesOptions.querySelectorAll('[data-role-id]').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const rid = String(btn.getAttribute('data-role-id'));
        if (immuneRoles.includes(rid)) {
          immuneRoles = immuneRoles.filter(id => id !== rid);
        } else {
          immuneRoles.push(rid);
        }
        renderImmuneRoleChips();
        renderImmuneRoleOptions(immuneRolesSearch.value);
        try {
          await persistImmunity();
        } catch (err) {
          Toast.error('Failed to save immune roles: ' + err.message);
        }
      };
    });
  }

  function renderImmuneUsers() {
    if (!immuneUsers.length) {
      immuneUsersContainer.innerHTML = `<p class="text-xs text-neutral-500 py-3">No immune users added yet. Enter a Discord User ID above and click "Add ID".</p>`;
      return;
    }

    immuneUsersContainer.innerHTML = `
      <div class="divide-y divide-neutral-800/60 rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
        ${immuneUsers.map((u, idx) => `
          <div class="group flex items-center justify-between gap-3 p-3 hover:bg-neutral-800/40 transition-colors">
            <div class="flex items-center gap-3 min-w-0">
              <img 
                src="${esc(u.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png')}" 
                alt="" 
                class="w-9 h-9 rounded-full object-cover shrink-0 border border-neutral-700/60"
                onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'"
              >
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-sm font-medium text-white truncate">${esc(u.name || ('User ' + u.id))}</span>
                  ${u.username ? `<span class="text-xs text-neutral-400 truncate">@${esc(u.username)}</span>` : ''}
                </div>
                <span class="text-[11px] font-mono text-neutral-500">${esc(u.id)}</span>
              </div>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
              <button 
                type="button" 
                data-remove-user-idx="${idx}" 
                class="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer" 
                title="Remove immune user"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    immuneUsersContainer.querySelectorAll('[data-remove-user-idx]').forEach(btn => {
      btn.onclick = async () => {
        const idx = parseInt(btn.getAttribute('data-remove-user-idx'), 10);
        if (isNaN(idx)) return;
        immuneUsers.splice(idx, 1);
        renderImmuneUsers();
        try {
          await persistImmunity();
        } catch (err) {
          Toast.error('Failed to update immune users: ' + err.message);
        }
      };
    });
  }

  async function handleAddImmuneUser() {
    const raw = immuneUserInput.value.trim();
    const uid = raw.replace(/\D/g, '');
    if (!uid || uid.length < 15) {
      Toast.error('Please enter a valid numeric Discord User ID (17-20 digits).');
      immuneUserInput.focus();
      return;
    }

    if (immuneUsers.some(u => String(u.id) === uid)) {
      Toast.error('This user is already on the immunity list.');
      return;
    }

    immuneUserAddBtn.disabled = true;
    const originalBtnHtml = immuneUserAddBtn.innerHTML;
    immuneUserAddBtn.innerHTML = `
      <svg class="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span>Adding...</span>
    `;

    let resolvedUser = null;

    // 1. Check local server members cache first
    const localM = members.find(m => String(m.id) === uid);
    if (localM) {
      resolvedUser = {
        id: uid,
        name: localM.name || localM.username || (`User ${uid}`),
        username: localM.username || '',
        avatar: localM.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'
      };
    } else {
      // 2. Fetch directly via Discord user resolver
      try {
        const res = await API.resolveUser(uid);
        if (res && res.id) {
          resolvedUser = {
            id: String(res.id),
            name: res.global_name || res.name || (`User ${uid}`),
            username: res.name || '',
            avatar: res.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'
          };
        }
      } catch (_) {}
    }

    if (!resolvedUser) {
      resolvedUser = {
        id: uid,
        name: `User ${uid}`,
        username: '',
        avatar: 'https://cdn.discordapp.com/embed/avatars/0.png'
      };
    }

    immuneUsers.unshift(resolvedUser);
    immuneUserInput.value = '';
    immuneUserAddBtn.disabled = false;
    immuneUserAddBtn.innerHTML = originalBtnHtml;

    renderImmuneUsers();

    try {
      await persistImmunity();
    } catch (err) {
      Toast.error('Failed to save immunity: ' + err.message);
    }
  }

  immuneUserAddBtn.onclick = handleAddImmuneUser;
  immuneUserInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImmuneUser();
    }
  };

  // Immune Roles Dropdown Toggle
  immuneRolesBtn.onclick = (e) => {
    e.stopPropagation();
    const isHidden = immuneRolesDropdown.classList.contains('hidden');
    targetDropdown.classList.add('hidden');
    targetChevron.classList.remove('rotate-180');
    levelDropdown.classList.add('hidden');
    levelChevron.classList.remove('rotate-180');

    if (isHidden) {
      renderImmuneRoleOptions(immuneRolesSearch.value);
      immuneRolesDropdown.classList.remove('hidden');
      immuneRolesChevron.classList.add('rotate-180');
      setTimeout(() => immuneRolesSearch.focus(), 20);
    } else {
      immuneRolesDropdown.classList.add('hidden');
      immuneRolesChevron.classList.remove('rotate-180');
    }
  };

  immuneRolesDropdown.onclick = (e) => e.stopPropagation();
  immuneRolesSearch.oninput = () => renderImmuneRoleOptions(immuneRolesSearch.value);

  // Dashboard Access Dropdowns
  targetBtn.onclick = (e) => {
    e.stopPropagation();
    const isHidden = targetDropdown.classList.contains('hidden');
    levelDropdown.classList.add('hidden');
    levelChevron.classList.remove('rotate-180');
    immuneRolesDropdown.classList.add('hidden');
    immuneRolesChevron.classList.remove('rotate-180');
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
    immuneRolesDropdown.classList.add('hidden');
    immuneRolesChevron.classList.remove('rotate-180');
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
    immuneRolesDropdown.classList.add('hidden');
    immuneRolesChevron.classList.remove('rotate-180');
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
    } catch (err) {
      Toast.error('Failed to grant access: ' + err.message);
    }
  };

  // Initial Data Load
  try {
    const data = await API.getConfig(guildId);
    roles = Array.isArray(data.roles) ? data.roles : [];
    members = Array.isArray(data.members) ? data.members : [];
    const s = data.config?.settings || data.config?.Settings || data.settings || data.Settings || {};

    // 1. Dashboard access
    if (Array.isArray(s.dashboard_access)) {
      accessList = s.dashboard_access.map(item => {
        if (item.type === 'role') {
          const rMatch = roles.find(r => String(r.id) === String(item.id));
          return {
            ...item,
            name: item.name || (rMatch ? rMatch.name : `Role ${item.id}`),
            color: item.color || (rMatch && rMatch.color && rMatch.color !== '#000000' && rMatch.color !== 0 ? (typeof rMatch.color === 'number' ? '#' + rMatch.color.toString(16).padStart(6, '0') : rMatch.color) : '#99aab5')
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

    // 2. Immune Roles
    if (Array.isArray(s.immune_roles)) {
      immuneRoles = s.immune_roles.map(r => String(r.id || r));
    }
    renderImmuneRoleChips();

    // 3. Immune Users
    if (Array.isArray(s.immune_users)) {
      immuneUsers = s.immune_users.map(u => {
        if (typeof u === 'string') {
          const m = members.find(mem => String(mem.id) === u);
          return {
            id: u,
            name: m ? (m.name || m.username || (`User ${u}`)) : (`User ${u}`),
            username: m ? (m.username || '') : '',
            avatar: m ? (m.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png') : 'https://cdn.discordapp.com/embed/avatars/0.png'
          };
        }
        return {
          id: String(u.id),
          name: u.name || (`User ${u.id}`),
          username: u.username || '',
          avatar: u.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'
        };
      });
    }
    renderImmuneUsers();

  } catch (_) {}
};
