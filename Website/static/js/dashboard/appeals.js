/**
 * Orbit Dashboard - Ban Appeals Tab
 */

function renderAppealsModule(el, guildId, aCfg) {
  let enabled = aCfg.enabled !== false;
  let customUrl = aCfg.custom_url || 'orbit';
  let allowed = aCfg.allowed_punishments || ['ban', 'timeout'];

  const punishments = [
    { id: 'ban', label: 'Bans' },
    { id: 'timeout', label: 'Timeouts / Mutes' },
    { id: 'kick', label: 'Kicks' },
    { id: 'warn', label: 'Warnings' }
  ];

  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Ban Appeals System</h1>
        <p class="text-xs text-neutral-400 mt-1">Branded web portal for penalized members to submit pardon requests.</p>
      </div>
      <button type="button" id="save-appeals-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-95">Save Changes</button>
    </div>

    <!-- Master Toggle -->
    <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
      <div class="flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
          ${icon('shield-alert', 20)}
        </div>
        <div>
          <span class="text-sm font-semibold text-white">Enable Appeals</span>
          <p class="text-xs text-neutral-500">Allow punished users to submit appeals online.</p>
        </div>
      </div>
      ${renderToggle({ id: 'appeals-toggle', checked: enabled, onChange: (v) => { enabled = v; } })}
    </div>

    <!-- Custom URL -->
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-3">
      <label class="text-xs font-semibold text-neutral-300">Custom Appeal Link</label>
      <div class="flex items-center gap-2">
        <span class="px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-500 font-mono">/appeal/</span>
        <input type="text" id="appeal-custom-url" value="${customUrl}" class="flex-1 px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none">
        <a href="/appeal/${customUrl}" target="_blank" class="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
          ${icon('external-link', 14)} Preview Portal
        </a>
      </div>
    </div>

    <!-- Allowed Punishments -->
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-3">
      <label class="text-xs font-semibold text-neutral-300">Allowed Punishments to Appeal</label>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        ${punishments.map(p => `
          <label class="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 cursor-pointer hover:border-neutral-700">
            <input type="checkbox" class="appeal-p-chk rounded bg-neutral-900 border-neutral-700 text-indigo-500 focus:ring-0" value="${p.id}" ${allowed.includes(p.id) ? 'checked' : ''}>
            <span>${p.label}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('save-appeals-btn').onclick = async () => {
    const btn = document.getElementById('save-appeals-btn');
    btn.textContent = 'Saving...';
    const checked = Array.from(document.querySelectorAll('.appeal-p-chk:checked')).map(c => c.value);
    const newUrl = document.getElementById('appeal-custom-url')?.value?.trim() || 'orbit';

    try {
      await API.saveConfig(guildId, {
        appeals: {
          enabled,
          custom_url: newUrl,
          allowed_punishments: checked
        }
      });
      Toast.success('Appeal settings saved!');
    } catch (err) {
      Toast.error('Failed to save: ' + err.message);
    } finally {
      btn.textContent = 'Save Changes';
    }
  };
}

window.renderAppealsModule = renderAppealsModule;
DashboardTabs.Appeals = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'appeals');
};
