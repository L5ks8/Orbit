/**
 * Orbit Dashboard - Channel Automation Tab
 */

function renderAutomationModule(el, guildId, cfg, channelOptions) {
  let enabled = cfg.enabled !== false;
  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Channel Automation</h1>
        <p class="text-xs text-neutral-400 mt-1">Automatic thread creation, media-only channels, and auto-reactions.</p>
      </div>
      <button type="button" id="save-auto-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all">Save Changes</button>
    </div>
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
      <div>
        <span class="text-sm font-semibold text-white">Channel Automation Active</span>
        <p class="text-xs text-neutral-500">Run automatic reactions and thread dispatchers.</p>
      </div>
      ${renderToggle({ id: 'auto-toggle', checked: enabled, onChange: (v) => { enabled = v; } })}
    </div>
  `;
  document.getElementById('save-auto-btn').onclick = async () => {
    await API.saveConfig(guildId, { automation: { enabled } });
    Toast.success('Automation settings saved!');
  };
}

window.renderAutomationModule = renderAutomationModule;
DashboardTabs.Automation = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'automation');
};
