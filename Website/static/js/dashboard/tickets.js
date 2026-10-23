/**
 * Orbit Dashboard - Tickets Tab
 */

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

window.renderTicketsModule = renderTicketsModule;
DashboardTabs.Tickets = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'tickets');
};
