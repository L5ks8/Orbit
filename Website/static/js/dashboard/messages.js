/**
 * Orbit Dashboard - Messages & Audit Logs Tab
 */

function renderMessagesModule(el, guildId, cfg, channelOptions) {
  let enabled = cfg.enabled !== false;
  let ch = String(cfg.channel_id || '');
  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Message & Audit Logs</h1>
        <p class="text-xs text-neutral-400 mt-1">Track message deletions, edits, and member changes.</p>
      </div>
      <button type="button" id="save-msglog-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all">Save Changes</button>
    </div>
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-sm font-semibold text-white">Enable Message Logs</span>
          <p class="text-xs text-neutral-500">Forward deleted and edited messages to a designated log channel.</p>
        </div>
        ${renderToggle({ id: 'msglog-toggle', checked: enabled, onChange: (v) => { enabled = v; } })}
      </div>
      <div class="flex flex-col gap-2 pt-2">
        <label class="text-xs font-semibold text-neutral-300">Log Channel</label>
        ${renderCustomSelect({ id: 'msglog-ch-sel', options: channelOptions, value: ch, onChange: (v) => { ch = v; } })}
      </div>
    </div>
  `;
  document.getElementById('save-msglog-btn').onclick = async () => {
    await API.saveConfig(guildId, { messages: { enabled, channel_id: ch } });
    Toast.success('Message log settings saved!');
  };
}

window.renderMessagesModule = renderMessagesModule;
DashboardTabs.Messages = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'messages');
};
