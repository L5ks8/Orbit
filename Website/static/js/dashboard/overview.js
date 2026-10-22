/**
 * Orbit Dashboard - Overview Tab
 * Real-time server stats, module toggles, and recent moderation activity.
 */

DashboardTabs.Overview = async function(container, guildId) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-6xl mx-auto animate-fade-in">
      <!-- Loading State -->
      <div id="overview-loading" class="flex items-center justify-center p-12 text-neutral-500 text-sm">
        <svg class="animate-spin mr-3 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Loading server overview...
      </div>

      <div id="overview-content" class="hidden flex flex-col gap-6"></div>
    </div>
  `;

  try {
    const [configData, statsData, modActivity] = await Promise.all([
      API.getConfig(guildId).catch(() => ({})),
      API.getGuildStats(guildId, 7).catch(() => ({})),
      API.getModActivity(guildId).catch(() => ([]))
    ]);

    const cfg = configData.config || configData || {};
    const modules = [
      { id: 'automod', key: 'automod', name: 'Auto-Moderation', desc: 'Filter spam and bad words', iconName: 'shield', color: 'text-red-400' },
      { id: 'tickets', key: 'ticket', name: 'Support Tickets', desc: 'Private support channels', iconName: 'ticket', color: 'text-teal-400' },
      { id: 'welcomegoodbye', key: 'welcome', name: 'Welcome & Goodbye', desc: 'Member join greetings', iconName: 'message-square', color: 'text-blue-400' },
      { id: 'level', key: 'level', name: 'Leveling System', desc: 'XP and role rewards', iconName: 'activity', color: 'text-emerald-400' },
      { id: 'serverstats', key: 'serverstats', name: 'Server Stats', desc: 'Voice counter channels', iconName: 'bar-chart-2', color: 'text-cyan-400' },
      { id: 'boost', key: 'boost', name: 'Boost Messages', desc: 'Celebrate boosts', iconName: 'zap', color: 'text-pink-400' },
      { id: 'appeals', key: 'appeals', name: 'Ban Appeals', desc: 'Web appeal submissions', iconName: 'shield-alert', color: 'text-purple-400' },
      { id: 'autoresponder', key: 'autoresponder', name: 'Auto Responder', desc: 'Keyword trigger replies', iconName: 'message-square', color: 'text-amber-400' }
    ];

    const content = document.getElementById('overview-content');
    const loading = document.getElementById('overview-loading');
    if (!content) return;

    content.innerHTML = `
      <!-- Server Hero Card -->
      <div class="relative p-6 md:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="flex items-center gap-5">
            <div class="w-16 h-16 rounded-2xl bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
              ${icon('bot', 32, 'text-indigo-400')}
            </div>
            <div>
              <h1 class="text-2xl font-extrabold text-white">Orbit Server Control</h1>
              <p class="text-neutral-400 text-xs md:text-sm mt-1">Configure and monitor your bot features in real time.</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <a href="/dashboard/${guildId}/settings" class="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors flex items-center gap-2">
              ${icon('settings', 14)} Server Settings
            </a>
            <a href="https://discord.com/oauth2/authorize?client_id=1480221897131299037&permissions=8&scope=bot%20applications.commands&guild_id=${guildId}" target="_blank" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20">
              ${icon('plus', 14)} Re-Authorize Bot
            </a>
          </div>
        </div>
      </div>

      <!-- Quick Stats Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div class="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
            <span>Members</span>
            ${icon('users', 16, 'text-blue-400')}
          </div>
          <div class="text-2xl font-extrabold text-white">${statsData.member_count || '--'}</div>
        </div>

        <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div class="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
            <span>Active Modules</span>
            ${icon('sliders', 16, 'text-emerald-400')}
          </div>
          <div class="text-2xl font-extrabold text-white" id="active-modules-count">--</div>
        </div>

        <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div class="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
            <span>Mod Actions (7d)</span>
            ${icon('gavel', 16, 'text-red-400')}
          </div>
          <div class="text-2xl font-extrabold text-white">${Array.isArray(modActivity) ? modActivity.length : 0}</div>
        </div>

        <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div class="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
            <span>Bot Status</span>
            ${icon('zap', 16, 'text-indigo-400')}
          </div>
          <div class="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online & Operational
          </div>
        </div>
      </div>

      <!-- Modules Quick Toggle Grid -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-white">Feature Modules</h2>
          <span class="text-xs text-neutral-500">Toggle modules directly or click to open full settings</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          ${modules.map(mod => {
            const isEnabled = cfg[mod.key]?.enabled || false;
            return `
              <div class="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between gap-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0 ${mod.color}">
                      ${icon(mod.iconName, 20)}
                    </div>
                    <div class="flex flex-col min-w-0">
                      <a href="/dashboard/${guildId}/${mod.id}" class="text-sm font-semibold text-white hover:text-indigo-400 transition-colors truncate">${mod.name}</a>
                      <span class="text-[11px] text-neutral-500 truncate">${mod.desc}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-neutral-800/80">
                  <a href="/dashboard/${guildId}/${mod.id}" class="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-medium transition-colors">
                    Configure ${icon('arrow-right', 12)}
                  </a>
                  <button 
                    type="button" 
                    id="toggle-btn-${mod.key}" 
                    class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${isEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-neutral-400'}"
                    onclick="toggleOverviewModule('${guildId}', '${mod.key}', ${!isEnabled})"
                  >
                    ${isEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Recent Moderation Activity Feed -->
      <div class="p-6 rounded-3xl bg-neutral-900 border border-neutral-800">
        <h2 class="text-base font-bold text-white mb-4">Recent Moderation Actions</h2>
        ${Array.isArray(modActivity) && modActivity.length > 0 ? `
          <div class="flex flex-col divide-y divide-neutral-800">
            ${modActivity.slice(0, 5).map(act => `
              <div class="py-3 flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <span class="px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                    act.action === 'Ban' ? 'bg-red-500/10 text-red-400' :
                    act.action === 'Kick' ? 'bg-orange-500/10 text-orange-400' :
                    act.action === 'Mute' || act.action === 'Timeout' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-blue-500/10 text-blue-400'
                  }">${act.action || 'Mod Action'}</span>
                  <div class="text-xs text-neutral-300">
                    <strong class="text-white">${act.target_tag || act.target_id || 'User'}</strong>
                    <span class="text-neutral-500 mx-1">—</span>
                    <span class="text-neutral-400">${act.reason || 'No reason provided'}</span>
                  </div>
                </div>
                <div class="text-[11px] text-neutral-500 shrink-0">
                  ${act.timestamp ? new Date(act.timestamp * 1000).toLocaleDateString() : 'Recent'}
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <p class="text-xs text-neutral-500 py-4 text-center">No recent moderation activity logged.</p>
        `}
      </div>
    `;

    // Compute active modules count
    const activeCount = modules.filter(m => cfg[m.key]?.enabled).length;
    document.getElementById('active-modules-count').textContent = `${activeCount} / ${modules.length}`;

    loading.classList.add('hidden');
    content.classList.remove('hidden');

    window.toggleOverviewModule = async (gId, modKey, nextState) => {
      const btn = document.getElementById(`toggle-btn-${modKey}`);
      if (btn) btn.textContent = 'Saving...';

      try {
        const payload = {};
        payload[modKey] = { enabled: nextState };
        await API.saveConfig(gId, payload);
        Toast.success(`${modKey} is now ${nextState ? 'enabled' : 'disabled'}`);
        DashboardTabs.Overview(container, gId);
      } catch (err) {
        Toast.error('Failed to update module state');
        if (btn) btn.textContent = nextState ? 'Disabled' : 'Enabled';
      }
    };
  } catch (err) {
    container.innerHTML = `
      <div class="p-8 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-400 text-center">
        Error loading overview tab: ${err.message}
      </div>
    `;
  }
};
