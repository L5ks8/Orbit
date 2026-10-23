/**
 * Orbit Dashboard - Share Template Tab
 */

function renderShareTemplateModule(el, guildId) {
  el.innerHTML = `
    <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
      <div>
        <h1 class="text-xl font-bold text-white">Share Template</h1>
        <p class="text-xs text-neutral-400 mt-1">Export and publish your current server layout as a reusable template.</p>
      </div>
    </div>
    <div class="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 text-xs">
      Click below to snapshot your server's channels and roles into a shareable template link.
    </div>
  `;
}

window.renderShareTemplateModule = renderShareTemplateModule;
DashboardTabs.ShareTemplate = function(container, guildId) {
  return DashboardTabs.Modules(container, guildId, 'share-template');
};
