/**
 * Orbit Dashboard - Welcome & Goodbye Tab
 */

function renderWelcomeGoodbyeModule(el, guildId, wCfg, gCfg, channelOptions) {
  let wEnabled = wCfg.enabled !== false;
  let wChannel = String(wCfg.channel_id || '');
  let wMessage = wCfg.message || 'Welcome to {server}, {user}! Enjoy your stay.';

  let gEnabled = gCfg.enabled !== false;
  let gChannel = String(gCfg.channel_id || '');
  let gMessage = gCfg.message || 'Goodbye {user}, we will miss you!';

  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Welcome & Goodbye Messages</h1>
        <p class="text-xs text-neutral-400 mt-1">Greet new arrivals and announce member departures.</p>
      </div>
      <button type="button" id="save-welcome-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-95">Save Changes</button>
    </div>

    <!-- Welcome Card -->
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            ${icon('user-plus', 20)}
          </div>
          <div>
            <h2 class="text-sm font-bold text-white">Welcome Messages</h2>
            <p class="text-xs text-neutral-500">Sent when a member joins the server.</p>
          </div>
        </div>
        ${renderToggle({ id: 'welcome-toggle', checked: wEnabled, onChange: (v) => { wEnabled = v; } })}
      </div>

      <div class="flex flex-col gap-2 pt-2">
        <label class="text-xs font-semibold text-neutral-300">Welcome Channel</label>
        ${renderCustomSelect({
          id: 'welcome-channel-select',
          options: channelOptions,
          value: wChannel,
          placeholder: 'Select welcome channel...',
          onChange: (val) => { wChannel = val; }
        })}
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-semibold text-neutral-300">Message Content</label>
        <span class="text-[11px] text-neutral-500">Available variables: <code>{user}</code>, <code>{username}</code>, <code>{server}</code>, <code>{count}</code></span>
        <textarea id="welcome-msg" rows="3" class="px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">${wMessage}</textarea>
      </div>
    </div>

    <!-- Goodbye Card -->
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
            ${icon('user-minus', 20)}
          </div>
          <div>
            <h2 class="text-sm font-bold text-white">Goodbye Messages</h2>
            <p class="text-xs text-neutral-500">Sent when a member leaves the server.</p>
          </div>
        </div>
        ${renderToggle({ id: 'goodbye-toggle', checked: gEnabled, onChange: (v) => { gEnabled = v; } })}
      </div>

      <div class="flex flex-col gap-2 pt-2">
        <label class="text-xs font-semibold text-neutral-300">Goodbye Channel</label>
        ${renderCustomSelect({
          id: 'goodbye-channel-select',
          options: channelOptions,
          value: gChannel,
          placeholder: 'Select goodbye channel...',
          onChange: (val) => { gChannel = val; }
        })}
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-xs font-semibold text-neutral-300">Message Content</label>
        <textarea id="goodbye-msg" rows="3" class="px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">${gMessage}</textarea>
      </div>
    </div>
  `;

  document.getElementById('save-welcome-btn').onclick = async () => {
    const btn = document.getElementById('save-welcome-btn');
    btn.textContent = 'Saving...';
    try {
      await API.saveConfig(guildId, {
        welcome: {
          enabled: wEnabled,
          channel_id: wChannel,
          message: document.getElementById('welcome-msg')?.value || wMessage
        },
        goodbye: {
          enabled: gEnabled,
          channel_id: gChannel,
          message: document.getElementById('goodbye-msg')?.value || gMessage
        }
      });
      Toast.success('Welcome & Goodbye settings saved!');
    } catch (err) {
      Toast.error('Failed to save: ' + err.message);
    } finally {
      btn.textContent = 'Save Changes';
    }
  };
}

window.renderWelcomeGoodbyeModule = renderWelcomeGoodbyeModule;
DashboardTabs.Welcome = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'welcomegoodbye');
};
