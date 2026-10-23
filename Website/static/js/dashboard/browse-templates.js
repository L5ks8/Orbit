/**
 * Orbit Dashboard - Browse Templates Tab
 */

function renderBrowseTemplatesModule(el, guildId) {
  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Browse Server Templates</h1>
        <p class="text-xs text-neutral-400 mt-1">Explore community-crafted server templates and apply them in one click.</p>
      </div>
    </div>
    <div class="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 text-xs">
      Community templates directory is ready. Select a template to preview channels and roles.
    </div>
  `;
}

window.renderBrowseTemplatesModule = renderBrowseTemplatesModule;
DashboardTabs.BrowseTemplates = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'browse-templates');
};
