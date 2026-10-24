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
    </div>
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
      <div>
        <span class="text-sm font-semibold text-white">Channel Automation Active</span>
        <p class="text-xs text-neutral-500">Run automatic reactions and thread dispatchers.</p>
      </div>
      ${renderToggle({ id: 'auto-toggle', checked: enabled, onChange: async (v) => { enabled = v; await API.saveConfig(guildId, { automation: { enabled } }); } })}
    </div>
  `;
  const saveBtn = document.getElementById('save-auto-btn');
  if (saveBtn) {
    saveBtn.onclick = async () => {
      await API.saveConfig(guildId, { automation: { enabled } });
    };
  }
}

window.renderAutomationModule = renderAutomationModule;
DashboardTabs.Automation = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'automation');
};
