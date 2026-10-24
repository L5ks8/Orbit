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
    let data = await API.getCaptcha(token);
    const content = document.getElementById('verify-content');
    const loading = document.getElementById('verify-load');
    if (!content) return;

    function renderCard() {
      content.innerHTML = `
        <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
          <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            ${icon('scan-eye', 32)}
          </div>

          <div>
            <h1 class="text-xl font-bold text-white">${escapeHtml(data.guild_name || 'Server Verification')}</h1>
            <p class="text-xs text-neutral-400 mt-1">Please complete the challenge to verify your Discord account.</p>
          </div>

          ${data.is_captcha ? `
            <div class="w-full flex flex-col items-center gap-3">
              <div class="relative group p-4 bg-neutral-950 rounded-2xl border border-neutral-800 w-full flex items-center justify-center min-h-[96px]">
                <img id="captcha-img" src="${data.captcha_image}" class="h-20 object-contain rounded-lg select-none" alt="Captcha">
                <button type="button" id="refresh-captcha-btn" class="absolute right-3 top-3 p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer" title="New image challenge">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                </button>
              </div>
              <input type="text" id="captcha-input" maxlength="8" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" placeholder="Enter characters above..." class="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-center text-sm font-mono uppercase tracking-widest focus:outline-none focus:border-neutral-600 transition-colors">
            </div>
          ` : `
            <div class="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 w-full">
              Click the button below to instantly verify your account and join the server channels.
            </div>
          `}

          <button type="button" id="submit-verify-btn" class="w-full py-3.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-95 shadow-lg cursor-pointer">
            Complete Verification
          </button>
        </div>
      `;

      loading.classList.add('hidden');
      content.classList.remove('hidden');

      const input = document.getElementById('captcha-input');
      const submitBtn = document.getElementById('submit-verify-btn');
      const refreshBtn = document.getElementById('refresh-captcha-btn');

      if (input) {
        input.focus();
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            submitBtn?.click();
          }
        });
      }

      if (refreshBtn) {
        refreshBtn.onclick = async () => {
          refreshBtn.disabled = true;
          const svg = refreshBtn.querySelector('svg');
          if (svg) svg.classList.add('animate-spin');
          try {
            data = await API.getCaptcha(token);
            const img = document.getElementById('captcha-img');
            if (img && data.captcha_image) img.src = data.captcha_image;
            if (input) {
              input.value = '';
              input.focus();
            }
          } catch (e) {
            Toast.error('Could not refresh captcha image');
          } finally {
            refreshBtn.disabled = false;
            if (svg) svg.classList.remove('animate-spin');
          }
        };
      }

      if (submitBtn) {
        submitBtn.onclick = async () => {
          const solution = data.is_captcha ? (input?.value || '').trim().toUpperCase() : 'OK';

          if (data.is_captcha && !solution) {
            Toast.error('Please enter the captcha characters above');
            input?.focus();
            return;
          }

          submitBtn.textContent = 'Verifying...';
          submitBtn.disabled = true;

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
            submitBtn.disabled = false;
            submitBtn.textContent = 'Complete Verification';
            if (data.is_captcha && refreshBtn) {
              refreshBtn.click();
            }
          }
        };
      }
    }

    renderCard();
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
