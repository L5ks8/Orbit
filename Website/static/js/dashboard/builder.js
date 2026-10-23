/**
 * Orbit Dashboard - AI Builder Tab
 */

function renderBuilderModule(el, guildId, cfg) {
  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">AI Server Builder</h1>
        <p class="text-xs text-neutral-400 mt-1">Generate channels, categories, roles, and permissions automatically using AI.</p>
      </div>
    </div>
    <div class="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col gap-4">
      <label class="text-xs font-semibold text-neutral-300">Describe your server</label>
      <textarea id="ai-builder-prompt" rows="3" placeholder="e.g. A gaming community server for Valorant with ranked LFG channels, clips showcase, and staff moderation..." class="px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none"></textarea>
      <div class="flex justify-end">
        <button type="button" id="run-ai-builder-btn" class="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all">Generate Structure</button>
      </div>
    </div>
  `;
}

window.renderBuilderModule = renderBuilderModule;
DashboardTabs.Builder = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'builder');
};
