/**
 * Orbit Dashboard - Temporary Voice Channels Tab
 */

function renderTempVoiceModule(el, guildId, cfg, channelOptions) {
  let enabled = cfg.enabled !== false;
  let hubCh = String(cfg.hub_channel_id || '');
  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Temporary Voice Channels</h1>
        <p class="text-xs text-neutral-400 mt-1">Join-to-create temporary voice channels with automatic cleanup.</p>
      </div>
      <button type="button" id="save-tempvoice-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all">Save Changes</button>
    </div>
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-sm font-semibold text-white">Enable Temp Voice</span>
          <p class="text-xs text-neutral-500">Spawn dynamic voice rooms when members enter the hub channel.</p>
        </div>
        ${renderToggle({ id: 'tempvoice-toggle', checked: enabled, onChange: (v) => { enabled = v; } })}
      </div>
      <div class="flex flex-col gap-2 pt-2">
        <label class="text-xs font-semibold text-neutral-300">Hub Voice Channel (Join to Create)</label>
        ${renderCustomSelect({ id: 'tempvoice-ch-sel', options: channelOptions, value: hubCh, onChange: (v) => { hubCh = v; } })}
      </div>
    </div>
  `;
  document.getElementById('save-tempvoice-btn').onclick = async () => {
    await API.saveConfig(guildId, { tempvoice: { enabled, hub_channel_id: hubCh } });
    Toast.success('Temp Voice settings saved!');
  };
}

window.renderTempVoiceModule = renderTempVoiceModule;
DashboardTabs.TempVoice = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'tempvoice');
};
