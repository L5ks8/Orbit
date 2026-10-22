/**
 * Orbit Ban Appeal Portal
 * Allows penalized Discord users to look up their sanctions and submit appeal requests.
 */

Pages.Appeal = async function(container, customUrl) {
  container.innerHTML = `
    <div class="max-w-xl mx-auto px-6 pt-32 pb-24 animate-fade-in">
      <div id="appeal-loading" class="flex items-center justify-center p-12 text-neutral-500 text-sm">
        <svg class="animate-spin mr-3 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Loading appeal portal...
      </div>
      <div id="appeal-content" class="hidden flex flex-col gap-6"></div>
    </div>
  `;

  try {
    const info = await API.getAppealInfo(customUrl);
    const content = document.getElementById('appeal-content');
    const loading = document.getElementById('appeal-loading');
    if (!content) return;

    const user = await API.getUser();

    content.innerHTML = `
      <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
        <!-- Server Header -->
        <div class="flex items-center gap-4 pb-6 border-b border-neutral-800">
          <img src="${info.guild_icon ? `https://cdn.discordapp.com/icons/${info.guild_id}/${info.guild_icon}.png` : '/img/logo.png'}" class="w-14 h-14 rounded-2xl object-cover shrink-0" alt="${info.guild_name}">
          <div>
            <h1 class="text-xl font-bold text-white">${info.guild_name}</h1>
            <p class="text-xs text-neutral-400 mt-0.5">Official Sanction Appeal Portal</p>
          </div>
        </div>

        ${!user ? `
          <div class="text-center py-6">
            <p class="text-sm text-neutral-400 mb-6">Please sign in with Discord to verify your identity and view active punishments on this server.</p>
            <button 
              type="button" 
              onclick="API.login(window.location.pathname).then(() => Router.checkAuth().then(() => Router.handleRoute()))" 
              class="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              ${icon('bot', 18)} Login with Discord
            </button>
          </div>
        ` : `
          <!-- Appeal Submission Form -->
          <form id="appeal-form" class="flex flex-col gap-5">
            <div class="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <img src="${user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : '/img/logo.png'}" class="w-8 h-8 rounded-full" alt="${user.username}">
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-semibold text-white">${user.username}</span>
                <span class="text-[10px] text-neutral-500">ID: ${user.id}</span>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-neutral-300">Why was the sanction issued?</label>
              <textarea id="appeal-reason-inp" rows="3" required placeholder="Explain the context or reason why you were banned or timed out..." class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none"></textarea>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-neutral-300">Why should the staff team reconsider?</label>
              <textarea id="appeal-statement-inp" rows="4" required placeholder="Describe what has changed or why you believe your punishment should be lifted..." class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none"></textarea>
            </div>

            <button type="submit" id="submit-appeal-btn" class="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-95">
              ${icon('send', 14)} Submit Appeal Request
            </button>
          </form>
        `}
      </div>
    `;

    loading.classList.add('hidden');
    content.classList.remove('hidden');

    const form = document.getElementById('appeal-form');
    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submit-appeal-btn');
        btn.textContent = 'Submitting...';
        btn.disabled = true;

        const reason = document.getElementById('appeal-reason-inp')?.value?.trim();
        const statement = document.getElementById('appeal-statement-inp')?.value?.trim();

        try {
          await API.submitAppeal(customUrl, { reason, statement });
          Toast.success('Appeal submitted successfully! Server staff has been notified.');
          content.innerHTML = `
            <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 shadow-2xl text-center flex flex-col items-center gap-4 animate-fade-in">
              <div class="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                ${icon('check', 32)}
              </div>
              <h2 class="text-xl font-bold text-white">Appeal Submitted</h2>
              <p class="text-xs text-neutral-400 max-w-sm leading-relaxed">Your appeal has been securely routed to the ${info.guild_name} moderation team for review. You will receive an update in Discord once reviewed.</p>
              <a href="/" class="mt-4 px-6 py-2.5 rounded-xl bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-700 transition-colors">Return Home</a>
            </div>
          `;
        } catch (err) {
          Toast.error(err.message || 'Failed to submit appeal.');
          btn.disabled = false;
          btn.innerHTML = `${icon('send', 14)} Submit Appeal Request`;
        }
      };
    }
  } catch (err) {
    container.innerHTML = `
      <div class="max-w-md mx-auto pt-32 text-center p-8 bg-neutral-900 border border-neutral-800 rounded-3xl">
        <h2 class="text-lg font-bold text-white mb-2">Appeal Portal Not Found</h2>
        <p class="text-xs text-neutral-400 mb-6">The appeal link you provided is invalid or has been deactivated by the server administrator.</p>
        <a href="/" class="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold">Back to Home</a>
      </div>
    `;
  }
};
