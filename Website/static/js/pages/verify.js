/**
 * Orbit Web Verification Challenge
 * Resolves token, renders captcha or one-click button, and verifies user access.
 */

Pages.Verify = async function(container, token) {
  container.innerHTML = `
    <div class="max-w-md mx-auto px-6 pt-32 pb-24 animate-fade-in">
      <div id="verify-load" class="flex items-center justify-center p-12 text-neutral-500 text-sm">
        <svg class="animate-spin mr-3 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Validating verification session...
      </div>
      <div id="verify-content" class="hidden flex flex-col gap-6"></div>
    </div>
  `;

  try {
    const data = await API.getCaptcha(token);
    const content = document.getElementById('verify-content');
    const loading = document.getElementById('verify-load');
    if (!content) return;

    content.innerHTML = `
      <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
        <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
          ${icon('scan-eye', 32)}
        </div>

        <div>
          <h1 class="text-xl font-bold text-white">${data.guild_name || 'Server Verification'}</h1>
          <p class="text-xs text-neutral-400 mt-1">Please complete the challenge to verify your Discord account.</p>
        </div>

        ${data.is_captcha ? `
          <div class="w-full flex flex-col items-center gap-4">
            <div class="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 w-full flex items-center justify-center">
              <img src="${data.captcha_image}" class="h-20 object-contain rounded-lg" alt="Captcha">
            </div>
            <input type="text" id="captcha-input" placeholder="Enter characters above..." class="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-center text-sm uppercase tracking-widest focus:outline-none">
          </div>
        ` : `
          <div class="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 w-full">
            Click the button below to instantly verify your account and join the server channels.
          </div>
        `}

        <button type="button" id="submit-verify-btn" class="w-full py-3.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-95 shadow-lg">
          Complete Verification
        </button>
      </div>
    `;

    loading.classList.add('hidden');
    content.classList.remove('hidden');

    document.getElementById('submit-verify-btn').onclick = async () => {
      const btn = document.getElementById('submit-verify-btn');
      btn.textContent = 'Verifying...';
      btn.disabled = true;

      const solution = data.is_captcha ? (document.getElementById('captcha-input')?.value || '').trim() : 'ok';

      try {
        await API.verifyCaptcha(token, solution);
        Toast.success('Verified successfully! You may now return to Discord.');
        content.innerHTML = `
          <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-4 animate-fade-in">
            <div class="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              ${icon('check', 32)}
            </div>
            <h2 class="text-xl font-bold text-white">Verification Complete!</h2>
            <p class="text-xs text-neutral-400 max-w-xs">Your verified role has been granted in Discord. You can close this window now.</p>
          </div>
        `;
      } catch (err) {
        Toast.error(err.message || 'Verification failed. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Complete Verification';
      }
    };
  } catch (err) {
    container.innerHTML = `
      <div class="max-w-md mx-auto pt-32 text-center p-8 bg-neutral-900 border border-neutral-800 rounded-3xl">
        <h2 class="text-lg font-bold text-white mb-2">Invalid or Expired Session</h2>
        <p class="text-xs text-neutral-400 mb-6">This verification link has expired or has already been used. Please click the button in Discord again to generate a new link.</p>
        <a href="/" class="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold">Home</a>
      </div>
    `;
  }
};
