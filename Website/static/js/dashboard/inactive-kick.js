/**
 * Orbit Dashboard - Inactive Kick Tab
 */

function renderInactiveKickModule(el, guildId, cfg) {
  let enabled = cfg.enabled === true;
  let days = cfg.days || 30;
  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Inactive Kick</h1>
        <p class="text-xs text-neutral-400 mt-1">Automatically prune members who have been inactive for a specified period.</p>
      </div>
      <button type="button" id="save-inactivekick-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all">Save Changes</button>
    </div>
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-sm font-semibold text-white">Enable Inactive Kick</span>
          <p class="text-xs text-neutral-500">Prune inactive members without roles automatically.</p>
        </div>
        ${renderToggle({ id: 'inactivekick-toggle', checked: enabled, onChange: (v) => { enabled = v; } })}
      </div>
      <div class="flex flex-col gap-2 pt-2">
        <label class="text-xs font-semibold text-neutral-300">Inactivity Threshold (Days)</label>
        <input type="number" min="1" max="365" id="inactivekick-days" value="${days}" class="w-32 px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
      </div>
    </div>
  `;
  document.getElementById('save-inactivekick-btn').onclick = async () => {
    await API.saveConfig(guildId, { inactive_kick: { enabled, days: parseInt(document.getElementById('inactivekick-days')?.value) || 30 } });
    Toast.success('Inactive Kick settings saved!');
  };
}

window.renderInactiveKickModule = renderInactiveKickModule;
DashboardTabs.InactiveKick = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'inactive-kick');
};
