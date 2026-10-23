/**
 * Orbit Dashboard - Auto Responder Tab
 */

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

window.renderAutoresponderModule = renderAutoresponderModule;
DashboardTabs.AutoResponder = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'autoresponder');
};
