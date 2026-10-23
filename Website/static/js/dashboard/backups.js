/**
 * Orbit Dashboard - Backups Tab
 */

function renderBackupsModule(el, guildId, cfg) {
  let enabled = cfg.enabled !== false;
  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Server Backups</h1>
        <p class="text-xs text-neutral-400 mt-1">Create and restore snapshots of your server roles, channels, and settings.</p>
      </div>
      <button type="button" id="save-backups-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all">Save Changes</button>
    </div>
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
      <div>
        <span class="text-sm font-semibold text-white">Automatic Server Backups</span>
        <p class="text-xs text-neutral-500">Keep periodic snapshots of server structure and permissions.</p>
      </div>
      ${renderToggle({ id: 'backups-toggle', checked: enabled, onChange: (v) => { enabled = v; } })}
    </div>
  `;
  document.getElementById('save-backups-btn').onclick = async () => {
    await API.saveConfig(guildId, { backups: { enabled } });
    Toast.success('Backup settings saved!');
  };
}

window.renderBackupsModule = renderBackupsModule;
DashboardTabs.Backups = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'backups');
};
