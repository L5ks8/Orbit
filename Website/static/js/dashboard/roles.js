/**
 * Orbit Dashboard - Roles Tab (/dashboard/:guildId/roles)
 */

DashboardTabs.Roles = async function(container, guildId) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">Server Roles</h1>
          <p class="text-xs text-neutral-400 mt-1">Overview of role hierarchy and membership in this server.</p>
        </div>
      </div>
      <div id="roles-list-content" class="flex flex-col gap-3">
        <div class="text-center py-12 text-neutral-500 text-sm">Loading roles...</div>
      </div>
    </div>
  `;

  try {
    const roles = await API.getRoles(guildId);
    const content = document.getElementById('roles-list-content');
    if (!content) return;

    content.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        ${roles.map(r => `
          <div class="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 truncate">
              <span class="w-3 h-3 rounded-full shrink-0" style="background-color: ${r.color || '#99aab5'}"></span>
              <span class="text-xs font-semibold text-white truncate">@${r.name}</span>
            </div>
            <span class="text-[10px] text-neutral-500 font-mono shrink-0">${r.id}</span>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="p-8 text-red-400 text-center">Error: ${err.message}</div>`;
  }
};
