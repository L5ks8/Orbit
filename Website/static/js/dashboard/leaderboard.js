/**
 * Orbit Dashboard - Leaderboard Tab (/dashboard/:guildId/leaderboard)
 */

DashboardTabs.Leaderboard = async function(container, guildId) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in">
      <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div>
          <h1 class="text-xl font-bold text-white">Server Leaderboard</h1>
          <p class="text-xs text-neutral-400 mt-1">Top active chatters ranked by level and experience.</p>
        </div>
        <a href="/leaderboard/${guildId}" target="_blank" class="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
          ${icon('external-link', 14)} Public Leaderboard Link
        </a>
      </div>
      <div id="dash-lb-list" class="flex flex-col gap-2">
        <div class="text-center py-12 text-neutral-500 text-sm">Loading leaderboard rankings...</div>
      </div>
    </div>
  `;

  try {
    const data = await API.getLeaderboard(guildId);
    const list = Array.isArray(data) ? data : (data?.users || []);
    const lbContainer = document.getElementById('dash-lb-list');
    if (!lbContainer) return;

    if (list.length === 0) {
      lbContainer.innerHTML = `<div class="p-8 text-center text-neutral-500 text-xs rounded-2xl bg-neutral-900 border border-neutral-800">No member activity recorded yet. Chat in text channels to earn XP!</div>`;
      return;
    }

    lbContainer.innerHTML = list.map((u, i) => `
      <div class="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="w-6 text-center text-xs font-bold text-neutral-500">#${i + 1}</span>
          <img src="${u.avatar || '/img/logo.png'}" class="w-9 h-9 rounded-full object-cover">
          <div>
            <span class="text-xs font-semibold text-white">${u.username || u.name || 'User'}</span>
            <p class="text-[10px] text-neutral-500">${u.messages || 0} messages</p>
          </div>
        </div>
        <div class="text-right">
          <span class="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-bold">Lvl ${u.level || 0}</span>
          <p class="text-[10px] text-neutral-500 mt-1">${u.xp || 0} XP</p>
        </div>
      </div>
    `).join('');
  } catch (err) {
    if (typeof window.renderErrorState === 'function') {
      window.renderErrorState(container, {
        title: 'Bestenliste konnte nicht geladen werden',
        message: 'Beim Abrufen der Leaderboard-Daten ist ein Fehler aufgetreten.',
        details: err?.message || String(err),
        statusCode: err?.status || 500,
        onRetry: () => DashboardTabs.Leaderboard(container, guildId),
        backUrl: `/dashboard/${guildId}`
      });
    } else {
      container.innerHTML = `<div class="p-8 text-red-400 text-center">Failed to load leaderboard: ${err.message}</div>`;
    }
  }
};
