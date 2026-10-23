/**
 * Orbit Dashboard - Polls Tab
 */

function renderPollsModule(el, guildId, cfg, channelOptions) {
  let enabled = cfg.enabled !== false;
  let ch = String(cfg.channel_id || '');
  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Polls</h1>
        <p class="text-xs text-neutral-400 mt-1">Create interactive community polls and voting panels.</p>
      </div>
      <button type="button" id="save-polls-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all">Save Changes</button>
    </div>
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-sm font-semibold text-white">Enable Polls</span>
          <p class="text-xs text-neutral-500">Allow creating and voting on community polls.</p>
        </div>
        ${renderToggle({ id: 'polls-toggle', checked: enabled, onChange: (v) => { enabled = v; } })}
      </div>
      <div class="flex flex-col gap-2 pt-2">
        <label class="text-xs font-semibold text-neutral-300">Default Poll Channel</label>
        ${renderCustomSelect({ id: 'polls-ch-sel', options: channelOptions, value: ch, onChange: (v) => { ch = v; } })}
      </div>
    </div>
  `;
  document.getElementById('save-polls-btn').onclick = async () => {
    await API.saveConfig(guildId, { polls: { enabled, channel_id: ch } });
    Toast.success('Poll settings saved!');
  };
}

window.renderPollsModule = renderPollsModule;
DashboardTabs.Polls = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'polls');
};
