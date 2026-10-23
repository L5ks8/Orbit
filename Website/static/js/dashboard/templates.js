/**
 * Orbit Dashboard - My Templates Tab
 */

function renderTemplatesModule(el, guildId) {
  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">My Templates</h1>
        <p class="text-xs text-neutral-400 mt-1">Manage your saved server templates.</p>
      </div>
    </div>
    <div class="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 text-xs">
      You haven't saved any templates yet.
    </div>
  `;
}

window.renderTemplatesModule = renderTemplatesModule;
DashboardTabs.Templates = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'templates');
};
