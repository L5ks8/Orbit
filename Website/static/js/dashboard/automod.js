/**
 * Orbit Dashboard - Auto-Moderation Tab
 */

function renderAutomodModule(el, guildId, aCfg, channelOptions, roleOptions) {
  let enabled = aCfg.enabled !== false;
  let action = aCfg.action || 'warn';
  let badwords = aCfg.badwords || [];
  let antiLinks = aCfg.anti_links || false;
  let antiSpam = aCfg.anti_spam || false;
  let massMentions = aCfg.mass_mentions || 5;

  const updateUI = () => {
    el.innerHTML = `
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">Auto-Moderation</h1>
          <p class="text-xs text-neutral-400 mt-1">Automated filters against bad words, spam, links, and mass mentions.</p>
        </div>
        <button type="button" id="save-automod-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-95">Save Changes</button>
      </div>

      <!-- Master Toggle -->
      <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
            ${icon('shield', 20)}
          </div>
          <div>
            <span class="text-sm font-semibold text-white">AutoMod Active</span>
            <p class="text-xs text-neutral-500">Automatically enforce chat compliance rules.</p>
          </div>
        </div>
        ${renderToggle({ id: 'automod-enabled-toggle', checked: enabled, onChange: (v) => { enabled = v; } })}
      </div>

      <!-- Action Configuration -->
      <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
        <h2 class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Violation Penalty</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          ${['warn', 'timeout', 'kick', 'ban'].map(act => `
            <button 
              type="button" 
              class="automod-action-btn p-3 rounded-xl border text-center transition-all ${
                action === act 
                  ? 'bg-neutral-800 border-indigo-500 text-white font-bold' 
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
              }"
              data-action="${act}"
            >
              <div class="text-xs uppercase tracking-wider">${act}</div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Bad Words Filter -->
      <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
        <div>
          <h2 class="text-sm font-bold text-white">Blocked Words & Regex</h2>
          <p class="text-xs text-neutral-500">Messages containing these terms will be deleted and penalized.</p>
        </div>

        <div class="flex gap-2">
          <input type="text" id="new-badword-input" placeholder="Add word or phrase..." class="flex-1 px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
          <button type="button" id="add-badword-btn" class="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold">${icon('plus', 14)} Add</button>
        </div>

        <div class="flex flex-wrap gap-2 pt-2" id="badwords-chips">
          ${badwords.map((w, idx) => `
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
              ${w}
              <button type="button" class="remove-badword-btn text-neutral-500 hover:text-red-400" data-idx="${idx}">${icon('x', 12)}</button>
            </span>
          `).join('')}
          ${badwords.length === 0 ? `<span class="text-xs text-neutral-500">No words blocked yet.</span>` : ''}
        </div>
      </div>

      <!-- Filters Toggles -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span class="text-sm font-semibold text-white">Block Discord Invites</span>
            <p class="text-xs text-neutral-500">Delete external discord.gg / discord.com invite links.</p>
          </div>
          ${renderToggle({ id: 'antilinks-toggle', checked: antiLinks, onChange: (v) => { antiLinks = v; } })}
        </div>

        <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
          <div>
            <span class="text-sm font-semibold text-white">Anti-Spam Rate Limit</span>
            <p class="text-xs text-neutral-500">Prevent rapid message sending.</p>
          </div>
          ${renderToggle({ id: 'antispam-toggle', checked: antiSpam, onChange: (v) => { antiSpam = v; } })}
        </div>
      </div>
    `;

    // Action button clicks
    document.querySelectorAll('.automod-action-btn').forEach(btn => {
      btn.onclick = () => {
        action = btn.getAttribute('data-action');
        updateUI();
      };
    });

    // Add bad word
    document.getElementById('add-badword-btn').onclick = () => {
      const inp = document.getElementById('new-badword-input');
      const val = inp?.value?.trim().toLowerCase();
      if (val && !badwords.includes(val)) {
        badwords.push(val);
        updateUI();
      }
    };

    // Remove bad word
    document.querySelectorAll('.remove-badword-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        badwords.splice(idx, 1);
        updateUI();
      };
    });

    // Save
    document.getElementById('save-automod-btn').onclick = async () => {
      const btn = document.getElementById('save-automod-btn');
      btn.textContent = 'Saving...';
      try {
        await API.saveConfig(guildId, {
          automod: {
            enabled,
            action,
            badwords,
            anti_links: antiLinks,
            anti_spam: antiSpam,
            mass_mentions: massMentions
          }
        });
        Toast.success('AutoMod settings saved successfully!');
      } catch (err) {
        Toast.error('Failed to save AutoMod: ' + err.message);
      } finally {
        btn.textContent = 'Save Changes';
      }
    };
  };

  updateUI();
}

window.renderAutomodModule = renderAutomodModule;
DashboardTabs.AutoMod = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'automod');
};
