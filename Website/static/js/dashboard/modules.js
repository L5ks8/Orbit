/**
 * Orbit Dashboard - Modules Loader & Dispatcher
 * Loads guild configuration, channels, and roles, and delegates to individual tab files.
 */

DashboardTabs.Modules = async function(container, guildId, moduleId) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in">
      <div id="module-loading" class="flex items-center justify-center p-12 text-neutral-500 text-sm">
        <svg class="animate-spin mr-3 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Loading module configuration...
      </div>
      <div id="module-content" class="hidden flex flex-col gap-6"></div>
    </div>
  `;

  try {
    const [configData, channels, roles] = await Promise.all([
      API.getConfig(guildId).catch(() => ({})),
      API.getChannels(guildId).catch(() => ([])),
      API.getRoles(guildId).catch(() => ([]))
    ]);

    const cfg = configData.config || configData || {};
    const categories = configData.categories || [];
    const channelOptions = channels.map(c => ({ value: String(c.id), label: `# ${c.name}` }));
    const roleOptions = roles.map(r => ({ value: String(r.id), label: `@ ${r.name}`, color: r.color }));
    const categoryOptions = categories.map(c => ({ value: String(c.id), label: c.name }));

    const content = document.getElementById('module-content');
    const loading = document.getElementById('module-loading');
    if (!content) return;

    if (moduleId === 'tickets' && window.renderTicketsModule) {
      window.renderTicketsModule(content, guildId, cfg.ticket || {}, channelOptions, roleOptions, categoryOptions);
    } else if (moduleId === 'automod' && window.renderAutomodModule) {
      window.renderAutomodModule(content, guildId, cfg.automod || {}, channelOptions, roleOptions);
    } else if ((moduleId === 'welcomegoodbye' || moduleId === 'welcome') && window.renderWelcomeGoodbyeModule) {
      window.renderWelcomeGoodbyeModule(content, guildId, cfg.welcome || {}, cfg.goodbye || {}, channelOptions);
    } else if (moduleId === 'autoresponder' && window.renderAutoresponderModule) {
      window.renderAutoresponderModule(content, guildId, cfg.autoresponder || {});
    } else if (moduleId === 'appeals' && window.renderAppealsModule) {
      window.renderAppealsModule(content, guildId, cfg.appeals || {});
    } else if (moduleId === 'automation' && window.renderAutomationModule) {
      window.renderAutomationModule(content, guildId, cfg.automation || {}, channelOptions);
    } else if (moduleId === 'boost' && window.renderBoostModule) {
      window.renderBoostModule(content, guildId, cfg.boost || {}, channelOptions);
    } else if (moduleId === 'messages' && window.renderMessagesModule) {
      window.renderMessagesModule(content, guildId, cfg.messages || {}, channelOptions);
    } else if (moduleId === 'serverstats' && window.renderServerStatsModule) {
      window.renderServerStatsModule(content, guildId, cfg.serverstats || {}, categoryOptions);
    } else if (moduleId === 'tempvoice' && window.renderTempVoiceModule) {
      window.renderTempVoiceModule(content, guildId, cfg.tempvoice || {}, channelOptions);
    } else if (moduleId === 'level' && window.renderLevelingModule) {
      window.renderLevelingModule(content, guildId, cfg.level || {}, channelOptions, roleOptions);
    } else if (moduleId === 'builder' && window.renderBuilderModule) {
      window.renderBuilderModule(content, guildId, cfg.builder || {});
    } else if (moduleId === 'polls' && window.renderPollsModule) {
      window.renderPollsModule(content, guildId, cfg.polls || {}, channelOptions);
    } else if (moduleId === 'giveaways' && window.renderGiveawaysModule) {
      window.renderGiveawaysModule(content, guildId, cfg.giveaways || {}, channelOptions);
    } else if (moduleId === 'backups' && window.renderBackupsModule) {
      window.renderBackupsModule(content, guildId, cfg.backups || {});
    } else if (moduleId === 'inactive-kick' && window.renderInactiveKickModule) {
      window.renderInactiveKickModule(content, guildId, cfg.inactive_kick || {});
    } else {
      content.innerHTML = `<div class="p-8 text-center text-neutral-400">Module "${moduleId}" not found.</div>`;
    }

    loading.classList.add('hidden');
    content.classList.remove('hidden');
  } catch (err) {
    if (typeof window.renderErrorState === 'function') {
      window.renderErrorState(container, {
        title: 'Modul konnte nicht geladen werden',
        message: 'An error occurred while fetching module configuration.',
        details: err?.message || String(err),
        statusCode: err?.status || 500,
        onRetry: () => DashboardTabs.Modules(container, guildId, moduleId),
        backUrl: `/dashboard/${guildId}`
      });
    } else {
      container.innerHTML = `
        <div class="p-8 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-400 text-center">
          Failed to load module: ${err.message}
        </div>
      `;
    }
  }
};
