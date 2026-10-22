/**
 * Orbit Dashboard - Verification Tab
 * Verification Mode, Role Assignment, Timeout Penalty, and Panel Deployer.
 */

DashboardTabs.Verification = async function(container, guildId) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in">
      <div id="verify-loading" class="flex items-center justify-center p-12 text-neutral-500 text-sm">
        <svg class="animate-spin mr-3 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Loading verification settings...
      </div>
      <div id="verify-content" class="hidden flex flex-col gap-6"></div>
    </div>
  `;

  try {
    const [configData, channels, roles] = await Promise.all([
      API.getConfig(guildId).catch(() => ({})),
      API.getChannels(guildId).catch(() => ([])),
      API.getRoles(guildId).catch(() => ([]))
    ]);

    const vCfg = configData.config?.verify || configData.verify || {};
    const channelOptions = channels.map(c => ({ value: String(c.id), label: `# ${c.name}` }));
    const roleOptions = roles.map(r => ({ value: String(r.id), label: `@ ${r.name}`, color: r.color }));

    let enabled = vCfg.enabled !== false;
    let verType = vCfg.verification_type || 'captcha';
    let roleId = String(vCfg.role_id || '');
    let removeRoleId = String(vCfg.remove_role_id || '');
    let panelChannel = String(vCfg.channel_id || '');
    let title = vCfg.embed_title || 'Verification Required';
    let desc = vCfg.embed_description || 'Click the button below to verify your account and gain access to the server.';
    let color = vCfg.embed_color || '#5865F2';

    const content = document.getElementById('verify-content');
    const loading = document.getElementById('verify-loading');
    if (!content) return;

    const modes = [
      { id: 'web_captcha', label: 'Web CAPTCHA', desc: 'Opens a browser challenge — most secure' },
      { id: 'captcha', label: 'Discord CAPTCHA', desc: 'Image-based captcha inside Discord' },
      { id: 'oneclick', label: 'One-Click', desc: 'Instant verify with a single button tap' }
    ];

    content.innerHTML = `
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">Server Verification Gate</h1>
          <p class="text-xs text-neutral-400 mt-1">Protect your server from bot raids with interactive verification.</p>
        </div>
        <button type="button" id="save-verify-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-95">Save Changes</button>
      </div>

      <!-- Master Toggle -->
      <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            ${icon('scan-eye', 20)}
          </div>
          <div>
            <span class="text-sm font-semibold text-white">Enable Verification Gate</span>
            <p class="text-xs text-neutral-500">Require newcomers to verify before accessing channels.</p>
          </div>
        </div>
        ${renderToggle({ id: 'verify-enabled-toggle', checked: enabled, onChange: (v) => { enabled = v; } })}
      </div>

      <!-- Verification Mode Cards -->
      <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
        <h2 class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Verification Challenge Mode</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          ${modes.map(m => `
            <button 
              type="button" 
              class="v-mode-btn p-4 rounded-xl border text-left transition-all ${
                verType === m.id 
                  ? 'bg-neutral-800 border-emerald-500 text-white font-semibold' 
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }" 
              data-mode="${m.id}"
            >
              <div class="text-sm font-bold text-white mb-1">${m.label}</div>
              <div class="text-xs text-neutral-500">${m.desc}</div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Role Configuration -->
      <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
        <h2 class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Role Assignments</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-neutral-300">Verified Role (Granted on verify)</label>
            ${renderCustomSelect({
              id: 'verify-role-select',
              options: roleOptions,
              value: roleId,
              placeholder: 'Select verified role...',
              onChange: (v) => { roleId = v; }
            })}
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-neutral-300">Unverified Role (Removed on verify)</label>
            ${renderCustomSelect({
              id: 'unverify-role-select',
              options: roleOptions,
              value: removeRoleId,
              placeholder: 'Select unverified role...',
              onChange: (v) => { removeRoleId = v; }
            })}
          </div>
        </div>
      </div>

      <!-- Deploy Panel Card -->
      <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            ${icon('send', 20)}
          </div>
          <div>
            <h2 class="text-sm font-bold text-white">Deploy Verification Panel</h2>
            <p class="text-xs text-neutral-500">Send the interactive verification embed into a channel.</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center pt-2">
          <div class="flex-1">
            ${renderCustomSelect({
              id: 'verify-channel-select',
              options: channelOptions,
              value: panelChannel,
              placeholder: 'Select verification channel...',
              onChange: (v) => { panelChannel = v; }
            })}
          </div>
          <button 
            type="button" 
            id="send-verify-panel-btn" 
            class="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-all active:scale-95 shrink-0"
          >
            ${icon('send', 14)} Send Verification Panel
          </button>
        </div>
      </div>
    `;

    loading.classList.add('hidden');
    content.classList.remove('hidden');

    document.querySelectorAll('.v-mode-btn').forEach(btn => {
      btn.onclick = () => {
        verType = btn.getAttribute('data-mode');
        document.querySelectorAll('.v-mode-btn').forEach(b => {
          b.className = `v-mode-btn p-4 rounded-xl border text-left transition-all ${
            b.getAttribute('data-mode') === verType 
              ? 'bg-neutral-800 border-emerald-500 text-white font-semibold' 
              : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
          }`;
        });
      };
    });

    document.getElementById('save-verify-btn').onclick = async () => {
      const btn = document.getElementById('save-verify-btn');
      btn.textContent = 'Saving...';
      try {
        await API.saveConfig(guildId, {
          verify: {
            enabled,
            verification_type: verType,
            role_id: roleId,
            remove_role_id: removeRoleId,
            channel_id: panelChannel,
            embed_title: title,
            embed_description: desc,
            embed_color: color
          }
        });
        Toast.success('Verification settings saved!');
      } catch (err) {
        Toast.error('Failed to save: ' + err.message);
      } finally {
        btn.textContent = 'Save Changes';
      }
    };

    document.getElementById('send-verify-panel-btn').onclick = async () => {
      if (!panelChannel) {
        Toast.error('Please select a verification channel first.');
        return;
      }
      const btn = document.getElementById('send-verify-panel-btn');
      btn.textContent = 'Sending...';
      const toastId = Toast.loading('Sending verification panel...');
      try {
        await document.getElementById('save-verify-btn').click();
        await API.sendVerifyPanel(guildId, panelChannel);
        Toast.update(toastId, 'Verification panel successfully sent!', 'success');
      } catch (err) {
        Toast.update(toastId, 'Failed to send panel: ' + err.message, 'error');
      } finally {
        btn.innerHTML = `${icon('send', 14)} Send Verification Panel`;
      }
    };
  } catch (err) {
    container.innerHTML = `<div class="p-8 text-red-400 text-center">Error: ${err.message}</div>`;
  }
};
