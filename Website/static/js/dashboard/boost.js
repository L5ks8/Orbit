/**
 * Orbit Dashboard - Boost Messages Tab
 */

function renderBoostModule(el, guildId, cfg, channelOptions) {
  let enabled = cfg.enabled !== false;
  let ch = String(cfg.channel_id || '');
  let msg = cfg.message || 'Thank you {user} for boosting the server!';
  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Boost Messages</h1>
        <p class="text-xs text-neutral-400 mt-1">Publicly announce and thank users when they boost your Discord server.</p>
      </div>
      <button type="button" id="save-boost-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all">Save Changes</button>
    </div>
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-sm font-semibold text-white">Enable Boost Announcements</span>
          <p class="text-xs text-neutral-500">Send custom messages on Nitro boosts.</p>
        </div>
        ${renderToggle({ id: 'boost-toggle', checked: enabled, onChange: (v) => { enabled = v; } })}
      </div>
      <div class="flex flex-col gap-2 pt-2">
        <label class="text-xs font-semibold text-neutral-300">Announce Channel</label>
        ${renderCustomSelect({ id: 'boost-ch-sel', options: channelOptions, value: ch, onChange: (v) => { ch = v; } })}
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-xs font-semibold text-neutral-300">Boost Message</label>
        <textarea id="boost-msg-input" rows="2" class="px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">${msg}</textarea>
      </div>
    </div>
  `;
  document.getElementById('save-boost-btn').onclick = async () => {
    await API.saveConfig(guildId, { boost: { enabled, channel_id: ch, message: document.getElementById('boost-msg-input')?.value || msg } });
    Toast.success('Boost message settings saved!');
  };
}

window.renderBoostModule = renderBoostModule;
DashboardTabs.Boost = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'boost');
};
