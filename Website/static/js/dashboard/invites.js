/**
 * Orbit Dashboard - Invite Tracker Tab (/dashboard/:guildId/invites)
 */

DashboardTabs.Invites = async function(container, guildId) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">Invite Tracker</h1>
          <p class="text-xs text-neutral-400 mt-1">Track member referrals, vanity links, and fake invite detection.</p>
        </div>
      </div>
      <div class="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center text-neutral-400 text-xs">
        Invite tracking engine is actively recording join sources and tracking member invitations in real time. Use <code>/invites</code> and <code>/inviteleaderboard</code> in Discord to view full metrics.
      </div>
    </div>
  `;
};
