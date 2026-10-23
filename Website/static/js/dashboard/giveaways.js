/**
 * Orbit Dashboard - Giveaways Tab
 */

function renderGiveawaysModule(el, guildId, cfg, channelOptions) {
  let enabled = cfg.enabled !== false;
  let ch = String(cfg.channel_id || '');
  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Giveaways</h1>
        <p class="text-xs text-neutral-400 mt-1">Host automated giveaways with role requirements and winner rerolls.</p>
      </div>
      <button type="button" id="save-giveaways-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all">Save Changes</button>
    </div>
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-sm font-semibold text-white">Enable Giveaways</span>
          <p class="text-xs text-neutral-500">Allow members to enter giveaways in your server.</p>
        </div>
        ${renderToggle({ id: 'giveaways-toggle', checked: enabled, onChange: (v) => { enabled = v; } })}
      </div>
      <div class="flex flex-col gap-2 pt-2">
        <label class="text-xs font-semibold text-neutral-300">Default Giveaway Channel</label>
        ${renderCustomSelect({ id: 'giveaways-ch-sel', options: channelOptions, value: ch, onChange: (v) => { ch = v; } })}
      </div>
    </div>
  `;
  document.getElementById('save-giveaways-btn').onclick = async () => {
    await API.saveConfig(guildId, { giveaways: { enabled, channel_id: ch } });
    Toast.success('Giveaway settings saved!');
  };
}

window.renderGiveawaysModule = renderGiveawaysModule;
DashboardTabs.Giveaways = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'giveaways');
};
