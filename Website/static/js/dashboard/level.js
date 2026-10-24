/**
 * Orbit Dashboard - Leveling & XP Tab
 */

function renderLevelingModule(el, guildId, cfg, channelOptions, roleOptions) {
  let enabled = cfg.enabled !== false;
  let ch = String(cfg.announcement_channel_id || '');
  let multiplier = cfg.xp_multiplier || 1.0;
  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Leveling & XP System</h1>
        <p class="text-xs text-neutral-400 mt-1">Reward active chatters with experience points, ranks, and role rewards.</p>
      </div>
    </div>
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-sm font-semibold text-white">Enable Leveling</span>
          <p class="text-xs text-neutral-500">Award XP for messages with cooldowns.</p>
        </div>
        ${renderToggle({ id: 'level-toggle', checked: enabled, onChange: async (v) => { enabled = v; await API.saveConfig(guildId, { level: { enabled, announcement_channel_id: ch, xp_multiplier: multiplier } }); } })}
      </div>
      <div class="flex flex-col gap-2 pt-2">
        <label class="text-xs font-semibold text-neutral-300">Level-Up Announcement Channel</label>
        ${renderCustomSelect({ id: 'level-ch-sel', options: channelOptions, value: ch, onChange: async (v) => { ch = v; await API.saveConfig(guildId, { level: { enabled, announcement_channel_id: ch, xp_multiplier: multiplier } }); } })}
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-xs font-semibold text-neutral-300">XP Multiplier</label>
        <input type="number" step="0.1" id="xp-mult-inp" value="${multiplier}" class="w-32 px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
      </div>
    </div>
  `;
  document.getElementById('save-level-btn').onclick = async () => {
    await API.saveConfig(guildId, { level: { enabled, announcement_channel_id: ch, xp_multiplier: parseFloat(document.getElementById('xp-mult-inp')?.value) || 1.0 } });
    Toast.success('Leveling settings saved!');
  };
}

window.renderLevelingModule = renderLevelingModule;
DashboardTabs.Level = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'level');
};
