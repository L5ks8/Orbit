/**
 * Orbit Dashboard - Server Stats Tab
 */

function renderServerStatsModule(el, guildId, sCfg, categoryOptions) {
  let enabled = sCfg.enabled !== false;
  let categoryId = String(sCfg.category_id || '');
  let usersName = sCfg.users_name || 'Users: {count}';
  let botsName = sCfg.bots_name || 'Bots: {count}';
  let boostsName = sCfg.boosts_name || 'Boosts: {count}';

  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Server Stats Counters</h1>
        <p class="text-xs text-neutral-400 mt-1">Display live server metrics as locked voice channels.</p>
      </div>
    </div>

    <!-- Master Toggle -->
    <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
      <div class="flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
          ${icon('bar-chart-2', 20)}
        </div>
        <div>
          <span class="text-sm font-semibold text-white">Enable Stats Channels</span>
          <p class="text-xs text-neutral-500">Automatically creates and updates voice counter channels.</p>
        </div>
      </div>
      ${renderToggle({ id: 'stats-toggle', checked: enabled, onChange: async (v) => { enabled = v; await API.saveConfig(guildId, { serverstats: { enabled, category_id: categoryId, users_name: usersName, bots_name: botsName, boosts_name: boostsName } }); } })}
    </div>

    <!-- Category Selector & Auto Setup -->
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <label class="text-xs font-semibold text-neutral-300">Category for Stats Channels</label>
          <span class="text-[11px] text-neutral-500 block">Where the counter voice channels will reside.</span>
        </div>
        <button type="button" id="setup-stats-auto-btn" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
          ${icon('zap', 14)} Auto-Setup Channels
        </button>
      </div>
      ${renderCustomSelect({
        id: 'stats-category-select',
        options: categoryOptions,
        value: categoryId,
        placeholder: 'Select category...',
        onChange: (val) => { categoryId = val; }
      })}
    </div>

    <!-- Channel Name Formats -->
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
      <h2 class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Channel Templates</h2>
      <div class="flex flex-col gap-3">
        <div>
          <label class="text-[11px] text-neutral-500 block mb-1">Total Members Channel</label>
          <input type="text" id="stats-users-fmt" value="${usersName}" class="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
        </div>
        <div>
          <label class="text-[11px] text-neutral-500 block mb-1">Bots Count Channel</label>
          <input type="text" id="stats-bots-fmt" value="${botsName}" class="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
        </div>
        <div>
          <label class="text-[11px] text-neutral-500 block mb-1">Server Boosts Channel</label>
          <input type="text" id="stats-boosts-fmt" value="${boostsName}" class="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
        </div>
      </div>
    </div>
  `;

  document.getElementById('save-serverstats-btn').onclick = async () => {
    const btn = document.getElementById('save-serverstats-btn');
    btn.textContent = 'Saving...';
    try {
      await API.saveConfig(guildId, {
        serverstats: {
          enabled,
          category_id: categoryId,
          users_name: document.getElementById('stats-users-fmt')?.value || usersName,
          bots_name: document.getElementById('stats-bots-fmt')?.value || botsName,
          boosts_name: document.getElementById('stats-boosts-fmt')?.value || boostsName,
          users_enabled: true,
          bots_enabled: true,
          boosts_enabled: true
        }
      });
      Toast.success('Server Stats settings saved!');
    } catch (err) {
      Toast.error('Failed to save: ' + err.message);
    } finally {
      btn.textContent = 'Save Changes';
    }
  };

  document.getElementById('setup-stats-auto-btn').onclick = async () => {
    const btn = document.getElementById('setup-stats-auto-btn');
    btn.textContent = 'Setting up...';
    try {
      await API.setupServerStats(guildId);
      Toast.success('Stats channels successfully generated in Discord!');
    } catch (err) {
      Toast.error('Setup failed: ' + err.message);
    } finally {
      btn.innerHTML = `${icon('zap', 14)} Auto-Setup Channels`;
    }
  };
}

window.renderServerStatsModule = renderServerStatsModule;
DashboardTabs.ServerStats = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'serverstats');
};
