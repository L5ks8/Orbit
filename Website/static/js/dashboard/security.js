/**
 * Orbit Dashboard - Security Tab (/dashboard/:guildId/security)
 */

DashboardTabs.Security = async function(container, guildId) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">Security & Anti-Raid</h1>
          <p class="text-xs text-neutral-400 mt-1">Honeypots, suspicious account lockdowns, and anti-nuke thresholds.</p>
        </div>
      </div>
      <div class="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 text-xs">
        Anti-Raid protections and rate limiters are active globally for this server. Honeypot channel alerts and verification gates can be configured under the Verification tab.
      </div>
    </div>
  `;
};
