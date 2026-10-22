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
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-4xl mx-auto animate-fade-in">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">Bot Profile</h1>
          <p class="text-xs text-neutral-400 mt-1">Customize Orbit's nickname and appearance specifically for this server.</p>
        </div>
        <button type="button" id="save-botprofile-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-95">Save Changes</button>
      </div>

      <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-5">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-neutral-300">Server Nickname</label>
          <input type="text" id="bot-nickname-input" placeholder="Orbit" class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
        </div>
      </div>
    </div>
  `;

  try {
    const profile = await API.getBotProfile(guildId);
    const nickInp = document.getElementById('bot-nickname-input');
    if (nickInp && profile?.nickname) nickInp.value = profile.nickname;

    document.getElementById('save-botprofile-btn').onclick = async () => {
      const btn = document.getElementById('save-botprofile-btn');
      btn.textContent = 'Saving...';
      try {
        await API.saveBotProfile(guildId, { nickname: nickInp.value });
        Toast.success('Bot profile updated!');
      } catch (err) {
        Toast.error('Failed to update: ' + err.message);
      } finally {
        btn.textContent = 'Save Changes';
      }
    };
  } catch (_) {}
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
