/**
 * Orbit Dashboard - Modules Handler
 * Complete settings UI for all 11 Discord bot feature modules.
 */

DashboardTabs.Modules = async function(container, guildId, moduleId) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in">
      <div id="module-loading" class="flex items-center justify-center p-12 text-neutral-500 text-sm">
        <svg class="animate-spin mr-3 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Loading module configuration...
      </div>
      <div id="module-content" class="hidden flex flex-col gap-6"></div>
    </div>
  `;

  try {
    const [configData, channels, roles] = await Promise.all([
      API.getConfig(guildId).catch(() => ({})),
      API.getChannels(guildId).catch(() => ([])),
      API.getRoles(guildId).catch(() => ([]))
    ]);

    const cfg = configData.config || configData || {};
    const categories = configData.categories || [];
    const channelOptions = channels.map(c => ({ value: String(c.id), label: `# ${c.name}` }));
    const roleOptions = roles.map(r => ({ value: String(r.id), label: `@ ${r.name}`, color: r.color }));
    const categoryOptions = categories.map(c => ({ value: String(c.id), label: c.name }));

    const content = document.getElementById('module-content');
    const loading = document.getElementById('module-loading');
    if (!content) return;

    if (moduleId === 'tickets') {
      renderTicketsModule(content, guildId, cfg.ticket || {}, channelOptions, roleOptions, categoryOptions);
    } else if (moduleId === 'automod') {
      renderAutomodModule(content, guildId, cfg.automod || {}, channelOptions, roleOptions);
    } else if (moduleId === 'welcomegoodbye') {
      renderWelcomeGoodbyeModule(content, guildId, cfg.welcome || {}, cfg.goodbye || {}, channelOptions);
    } else if (moduleId === 'autoresponder') {
      renderAutoresponderModule(content, guildId, cfg.autoresponder || {});
    } else if (moduleId === 'appeals') {
      renderAppealsModule(content, guildId, cfg.appeals || {});
    } else if (moduleId === 'automation') {
      renderAutomationModule(content, guildId, cfg.automation || {}, channelOptions);
    } else if (moduleId === 'boost') {
      renderBoostModule(content, guildId, cfg.boost || {}, channelOptions);
    } else if (moduleId === 'messages') {
      renderMessagesModule(content, guildId, cfg.messages || {}, channelOptions);
    } else if (moduleId === 'serverstats') {
      renderServerStatsModule(content, guildId, cfg.serverstats || {}, categoryOptions);
    } else if (moduleId === 'tempvoice') {
      renderTempVoiceModule(content, guildId, cfg.tempvoice || {}, channelOptions);
    } else if (moduleId === 'level') {
      renderLevelingModule(content, guildId, cfg.level || {}, channelOptions, roleOptions);
    } else {
      content.innerHTML = `<div class="p-8 text-center text-neutral-400">Module "${moduleId}" not found.</div>`;
    }

    loading.classList.add('hidden');
    content.classList.remove('hidden');
  } catch (err) {
    container.innerHTML = `
      <div class="p-8 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-400 text-center">
        Failed to load module: ${err.message}
      </div>
    `;
  }
};

// ==========================================
// 1. TICKETS MODULE
// ==========================================
function renderTicketsModule(el, guildId, tCfg, channelOptions, roleOptions, categoryOptions) {
  let panelChannel = String(tCfg.panel_channel_id || '');
  let logChannel = String(tCfg.log_channel_id || '');
  let enabled = tCfg.enabled !== false;
  let title = tCfg.panel_title || 'Support Tickets';
  let desc = tCfg.panel_description || 'Click the button below to open a direct support channel with our team.';
  let instructions = tCfg.panel_instructions || '> Select your desired inquiry category in the dropdown menu below, then click **Create Ticket**.';
  let slots = tCfg.options_slots || [{ name: 'General Support', role_id: '', category_id: '' }];

  const updateUI = () => {
    el.innerHTML = `
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">Support Tickets</h1>
          <p class="text-xs text-neutral-400 mt-1">Multi-category ticket panel with custom staff assignment and automated channel cleanup.</p>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" id="save-tickets-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-95">Save Changes</button>
        </div>
      </div>

      <!-- Master Toggle Card -->
      <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
        <div class="flex items-center gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
            ${icon('ticket', 20)}
          </div>
          <div>
            <span class="text-sm font-semibold text-white">Enable Ticket System</span>
            <p class="text-xs text-neutral-500">Allow members to open private channels from panels.</p>
          </div>
        </div>
        ${renderToggle({ id: 'ticket-enabled-toggle', checked: enabled, onChange: (v) => { enabled = v; } })}
      </div>

      <!-- Panel Configuration -->
      <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-5">
        <h2 class="text-sm font-bold text-white uppercase tracking-wider text-neutral-400">Panel Embed Configuration</h2>
        
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-neutral-300">Panel Title</label>
          <input type="text" id="tkt-title" value="${title}" class="px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-700">
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-neutral-300">Panel Description</label>
          <textarea id="tkt-desc" rows="2" class="px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-700">${desc}</textarea>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-neutral-300">Panel Instructions</label>
          <textarea id="tkt-instructions" rows="2" class="px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-700">${instructions}</textarea>
        </div>

        <!-- Panel Channel + Send Panel Button -->
        <div class="flex flex-col gap-2 pt-3 border-t border-neutral-800/80">
          <label class="text-xs font-semibold text-neutral-300">Panel Channel</label>
          <span class="text-[11px] text-neutral-500">Select the channel where the interactive ticket panel will be sent.</span>
          <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div class="flex-1">
              ${renderCustomSelect({
                id: 'tkt-panel-channel-select',
                options: channelOptions,
                value: panelChannel,
                placeholder: 'Select channel...',
                onChange: (val) => { panelChannel = val; }
              })}
            </div>
            <button 
              type="button" 
              id="send-ticket-panel-btn" 
              class="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-all active:scale-95 shrink-0"
            >
              ${icon('send', 14)} Send Ticket Panel
            </button>
          </div>
        </div>

        <!-- Log Channel -->
        <div class="flex flex-col gap-2 pt-3 border-t border-neutral-800/80">
          <label class="text-xs font-semibold text-neutral-300">Transcript / Log Channel</label>
          <span class="text-[11px] text-neutral-500">Channel where closed ticket transcripts will be archived.</span>
          <div class="w-full">
            ${renderCustomSelect({
              id: 'tkt-log-channel-select',
              options: channelOptions,
              value: logChannel,
              placeholder: 'Select log channel...',
              onChange: (val) => { logChannel = val; }
            })}
          </div>
        </div>
      </div>

      <!-- Ticket Inquiry Categories / Slots -->
      <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold text-white">Inquiry Categories</h2>
            <p class="text-xs text-neutral-500">Add the options users can choose from when creating a ticket.</p>
          </div>
          <button type="button" id="add-slot-btn" class="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
            ${icon('plus', 14)} Add Option
          </button>
        </div>

        <div class="flex flex-col gap-3" id="slots-list">
          ${slots.map((s, idx) => `
            <div class="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3" data-idx="${idx}">
              <div class="flex-1">
                <label class="text-[10px] text-neutral-500 block mb-1">Option Label</label>
                <input type="text" class="slot-name-input px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs w-full focus:outline-none" value="${s.name || ''}" placeholder="e.g. Billing Support">
              </div>
              <div class="flex-1">
                <label class="text-[10px] text-neutral-500 block mb-1">Support Staff Role</label>
                ${renderCustomSelect({
                  id: `slot-role-${idx}`,
                  options: roleOptions,
                  value: String(s.role_id || ''),
                  placeholder: 'Select role...',
                  onChange: (val) => { slots[idx].role_id = val; }
                })}
              </div>
              <div class="shrink-0 flex items-end">
                <button type="button" class="delete-slot-btn p-2 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-900 transition-colors" data-idx="${idx}">
                  ${icon('trash', 16)}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Save button
    document.getElementById('save-tickets-btn').onclick = async () => {
      const saveBtn = document.getElementById('save-tickets-btn');
      saveBtn.textContent = 'Saving...';

      // Read slots names
      document.querySelectorAll('.slot-name-input').forEach((input, i) => {
        if (slots[i]) slots[i].name = input.value;
      });

      const payload = {
        ticket: {
          enabled,
          panel_title: document.getElementById('tkt-title')?.value || title,
          panel_description: document.getElementById('tkt-desc')?.value || desc,
          panel_instructions: document.getElementById('tkt-instructions')?.value || instructions,
          panel_channel_id: panelChannel,
          log_channel_id: logChannel,
          options_slots: slots
        }
      };

      try {
        await API.saveConfig(guildId, payload);
        Toast.success('Ticket settings saved successfully!');
      } catch (err) {
        Toast.error('Failed to save ticket settings: ' + err.message);
      } finally {
        saveBtn.textContent = 'Save Changes';
      }
    };

    // Send ticket panel button
    document.getElementById('send-ticket-panel-btn').onclick = async () => {
      if (!panelChannel) {
        Toast.error('Please select a Panel Channel first.');
        return;
      }
      const btn = document.getElementById('send-ticket-panel-btn');
      btn.textContent = 'Sending...';
      const toastId = Toast.loading('Deploying ticket panel to channel...');

      try {
        // Save first
        await document.getElementById('save-tickets-btn').click();
        await API.sendTicketPanel(guildId, panelChannel);
        Toast.update(toastId, 'Ticket panel successfully sent to channel!', 'success');
      } catch (err) {
        Toast.update(toastId, 'Failed to send panel: ' + err.message, 'error');
      } finally {
        btn.innerHTML = `${icon('send', 14)} Send Ticket Panel`;
      }
    };

    // Add slot
    document.getElementById('add-slot-btn').onclick = () => {
      slots.push({ name: 'Support Option', role_id: '', category_id: '' });
      updateUI();
    };

    // Delete slot
    document.querySelectorAll('.delete-slot-btn').forEach(btn => {
      btn.onclick = (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
        slots.splice(idx, 1);
        updateUI();
      };
    });
  };

  updateUI();
}

// ==========================================
// 2. AUTOMOD MODULE
// ==========================================
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

// ==========================================
// 3. WELCOME & GOODBYE MODULE
// ==========================================
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

// ==========================================
// 4. BAN APPEALS MODULE
// ==========================================
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

// ==========================================
// 5. SERVER STATS MODULE
// ==========================================
function renderServerStatsModule(el, guildId, sCfg, categoryOptions) {
  let enabled = sCfg.enabled !== false;
  let categoryId = String(sCfg.category_id || '');
  let usersName = sCfg.users_name || 'Users: {count}';
  let botsName = sCfg.bots_name || 'Bots: {count}';
  let boostsName = sCfg.boosts_name || 'Boosts: {count}';

  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Server Stats Counters</h1>
        <p class="text-xs text-neutral-400 mt-1">Display live server metrics as locked voice channels.</p>
      </div>
      <button type="button" id="save-serverstats-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-95">Save Changes</button>
    </div>

    <!-- Master Toggle -->
    <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
      <div class="flex items-center gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
          ${icon('bar-chart-2', 20)}
        </div>
        <div>
          <span class="text-sm font-semibold text-white">Enable Stats Channels</span>
          <p class="text-xs text-neutral-500">Automatically creates and updates voice counter channels.</p>
        </div>
      </div>
      ${renderToggle({ id: 'stats-toggle', checked: enabled, onChange: (v) => { enabled = v; } })}
    </div>

    <!-- Category Selector & Auto Setup -->
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <label class="text-xs font-semibold text-neutral-300">Category for Stats Channels</label>
          <span class="text-[11px] text-neutral-500 block">Where the counter voice channels will reside.</span>
        </div>
        <button type="button" id="setup-stats-auto-btn" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
          ${icon('zap', 14)} Auto-Setup Channels
        </button>
      </div>
      ${renderCustomSelect({
        id: 'stats-category-select',
        options: categoryOptions,
        value: categoryId,
        placeholder: 'Select category...',
        onChange: (val) => { categoryId = val; }
      })}
    </div>

    <!-- Channel Name Formats -->
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
      <h2 class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Channel Templates</h2>
      <div class="flex flex-col gap-3">
        <div>
          <label class="text-[11px] text-neutral-500 block mb-1">Total Members Channel</label>
          <input type="text" id="stats-users-fmt" value="${usersName}" class="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
        </div>
        <div>
          <label class="text-[11px] text-neutral-500 block mb-1">Bots Count Channel</label>
          <input type="text" id="stats-bots-fmt" value="${botsName}" class="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
        </div>
        <div>
          <label class="text-[11px] text-neutral-500 block mb-1">Server Boosts Channel</label>
          <input type="text" id="stats-boosts-fmt" value="${boostsName}" class="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
        </div>
      </div>
    </div>
  `;

  document.getElementById('save-serverstats-btn').onclick = async () => {
    const btn = document.getElementById('save-serverstats-btn');
    btn.textContent = 'Saving...';
    try {
      await API.saveConfig(guildId, {
        serverstats: {
          enabled,
          category_id: categoryId,
          users_name: document.getElementById('stats-users-fmt')?.value || usersName,
          bots_name: document.getElementById('stats-bots-fmt')?.value || botsName,
          boosts_name: document.getElementById('stats-boosts-fmt')?.value || boostsName,
          users_enabled: true,
          bots_enabled: true,
          boosts_enabled: true
        }
      });
      Toast.success('Server Stats settings saved!');
    } catch (err) {
      Toast.error('Failed to save: ' + err.message);
    } finally {
      btn.textContent = 'Save Changes';
    }
  };

  document.getElementById('setup-stats-auto-btn').onclick = async () => {
    const btn = document.getElementById('setup-stats-auto-btn');
    btn.textContent = 'Setting up...';
    try {
      await API.setupServerStats(guildId);
      Toast.success('Stats channels successfully generated in Discord!');
    } catch (err) {
      Toast.error('Setup failed: ' + err.message);
    } finally {
      btn.innerHTML = `${icon('zap', 14)} Auto-Setup Channels`;
    }
  };
}

// ==========================================
// 6. AUTO RESPONDER MODULE
// ==========================================
function renderAutoresponderModule(el, guildId, arCfg) {
  let responses = arCfg.responses || [];

  const updateUI = () => {
    el.innerHTML = `
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">Auto Responder</h1>
          <p class="text-xs text-neutral-400 mt-1">Configure automated bot replies triggered by message keywords.</p>
        </div>
        <button type="button" id="add-responder-btn" class="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all flex items-center gap-1.5 active:scale-95">
          ${icon('plus', 14)} New Trigger
        </button>
      </div>

      <div class="flex flex-col gap-3">
        ${responses.map((r, idx) => `
          <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4">
            <div class="flex flex-col gap-1 min-w-0">
              <span class="text-xs font-bold text-indigo-400 uppercase tracking-wider">Trigger: "${r.trigger}"</span>
              <p class="text-xs text-neutral-300 truncate">${r.reply}</p>
            </div>
            <button type="button" class="del-ar-btn text-neutral-500 hover:text-red-400 p-2 rounded-lg hover:bg-neutral-800 transition-colors" data-idx="${idx}">
              ${icon('trash', 16)}
            </button>
          </div>
        `).join('')}

        ${responses.length === 0 ? `
          <div class="p-12 text-center text-neutral-500 rounded-2xl bg-neutral-900 border border-neutral-800">
            No auto responder triggers created yet. Click "New Trigger" above to add one.
          </div>
        ` : ''}
      </div>
    `;

    document.getElementById('add-responder-btn').onclick = () => {
      Modal.open({
        title: 'Add Auto Responder Trigger',
        content: `
          <div class="flex flex-col gap-3">
            <div>
              <label class="text-xs font-semibold text-neutral-300 block mb-1">Trigger Keyword</label>
              <input type="text" id="ar-modal-trigger" placeholder="e.g. !ip or rulebook" class="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
            </div>
            <div>
              <label class="text-xs font-semibold text-neutral-300 block mb-1">Bot Reply</label>
              <textarea id="ar-modal-reply" rows="3" placeholder="Message content the bot should reply with..." class="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none"></textarea>
            </div>
          </div>
        `,
        confirmText: 'Create Trigger',
        onConfirm: async () => {
          const trig = document.getElementById('ar-modal-trigger')?.value?.trim();
          const repl = document.getElementById('ar-modal-reply')?.value?.trim();
          if (!trig || !repl) {
            Toast.error('Please enter both a trigger and reply.');
            return;
          }
          responses.push({ trigger: trig, reply: repl });
          await API.saveConfig(guildId, { autoresponder: { responses } });
          Toast.success('Trigger added!');
          updateUI();
        }
      });
    };

    document.querySelectorAll('.del-ar-btn').forEach(btn => {
      btn.onclick = async () => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        responses.splice(idx, 1);
        await API.saveConfig(guildId, { autoresponder: { responses } });
        Toast.success('Trigger removed!');
        updateUI();
      };
    });
  };

  updateUI();
}

// Fallback handlers for remaining modules
function renderAutomationModule(el, guildId, cfg, channelOptions) {
  let enabled = cfg.enabled !== false;
  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Channel Automation</h1>
        <p class="text-xs text-neutral-400 mt-1">Automatic thread creation, media-only channels, and auto-reactions.</p>
      </div>
      <button type="button" id="save-auto-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all">Save Changes</button>
    </div>
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
      <div>
        <span class="text-sm font-semibold text-white">Channel Automation Active</span>
        <p class="text-xs text-neutral-500">Run automatic reactions and thread dispatchers.</p>
      </div>
      ${renderToggle({ id: 'auto-toggle', checked: enabled, onChange: (v) => { enabled = v; } })}
    </div>
  `;
  document.getElementById('save-auto-btn').onclick = async () => {
    await API.saveConfig(guildId, { automation: { enabled } });
    Toast.success('Automation settings saved!');
  };
}

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

function renderLevelingModule(el, guildId, cfg, channelOptions, roleOptions) {
  let enabled = cfg.enabled !== false;
  let ch = String(cfg.announcement_channel_id || '');
  let multiplier = cfg.xp_multiplier || 1.0;
  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Leveling & XP System</h1>
        <p class="text-xs text-neutral-400 mt-1">Reward active chatters with experience points, ranks, and role rewards.</p>
      </div>
      <button type="button" id="save-level-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all">Save Changes</button>
    </div>
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-sm font-semibold text-white">Enable Leveling</span>
          <p class="text-xs text-neutral-500">Award XP for messages with cooldowns.</p>
        </div>
        ${renderToggle({ id: 'level-toggle', checked: enabled, onChange: (v) => { enabled = v; } })}
      </div>
      <div class="flex flex-col gap-2 pt-2">
        <label class="text-xs font-semibold text-neutral-300">Level-Up Announcement Channel</label>
        ${renderCustomSelect({ id: 'level-ch-sel', options: channelOptions, value: ch, onChange: (v) => { ch = v; } })}
      </div>
      <div class="flex flex-col gap-2">
        <label class="text-xs font-semibold text-neutral-300">XP Multiplier</label>
        <input type="number" step="0.1" id="xp-mult-inp" value="${multiplier}" class="w-32 px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
      </div>
    </div>
  `;
  document.getElementById('save-level-btn').onclick = async () => {
    await API.saveConfig(guildId, { level: { enabled, announcement_channel_id: ch, xp_multiplier: parseFloat(document.getElementById('xp-mult-inp')?.value) || 1.0 } });
    Toast.success('Leveling settings saved!');
  };
}
