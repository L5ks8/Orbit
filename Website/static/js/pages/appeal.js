/**
 * Orbit Ban Appeal Portal (/appeal/:slug)
 * Public, responsive, pixel-perfect appeal submission interface for penalized members.
 */

(function () {
  'use strict';

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const SVGS = {
    discord: `<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
    scale: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path><path d="M7 21h10"></path><path d="M12 3v18"></path><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path></svg>`,
    shieldCheck: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
    send: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    alertCircle: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
  };

  Pages.Appeal = async function (container, customUrl) {
    container.innerHTML = `
      <div class="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-16 sm:py-24 animate-fade-in overflow-hidden">
        <!-- Ambient Background Glow -->
        <div class="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#5865F2]/10 blur-[120px] rounded-full"></div>
        <div class="pointer-events-none absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[250px] bg-indigo-600/5 blur-[100px] rounded-full"></div>

        <div id="appeal-loading" class="flex flex-col items-center justify-center p-12 text-neutral-400 gap-3">
          <div class="w-8 h-8 border-2 border-white/20 border-t-[#5865F2] rounded-full animate-spin"></div>
          <span class="text-xs font-medium tracking-wide">Loading server appeal portal...</span>
        </div>
        <div id="appeal-content" class="w-full max-w-xl hidden relative z-10"></div>
      </div>
    `;

    try {
      const info = await API.getAppealInfo(customUrl);
      const content = document.getElementById('appeal-content');
      const loading = document.getElementById('appeal-loading');
      if (!content) return;

      let user = null;
      try {
        user = await API.getUser();
      } catch (e) {
        user = null;
      }

      // Resolve guild icon safely
      let iconSrc = '/img/logo.png';
      if (info?.guild_icon) {
        if (info.guild_icon.startsWith('http')) {
          iconSrc = info.guild_icon;
        } else {
          iconSrc = `https://cdn.discordapp.com/icons/${info.guild_id}/${info.guild_icon}.png?size=256`;
        }
      }

      const guildName = info?.guild_name || 'Discord Community';
      const questions = Array.isArray(info?.custom_questions) && info.custom_questions.length > 0
        ? info.custom_questions
        : [
            { id: 'q1', label: 'Why was your sanction issued?', placeholder: 'Describe what happened and the context surrounding the sanction...', required: true },
            { id: 'q2', label: 'Why should the staff reconsider your punishment?', placeholder: 'Explain why you believe the punishment should be reconsidered and what will change...', required: true }
          ];

      content.innerHTML = `
        <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_40px_-20px_rgba(0,0,0,0.95)] flex flex-col gap-6">
          <!-- Server Header -->
          <div class="flex items-center gap-4 pb-6 border-b border-neutral-800">
            <div class="relative shrink-0">
              <img 
                src="${escapeHtml(iconSrc)}" 
                alt="${escapeHtml(guildName)}" 
                class="w-14 h-14 rounded-2xl object-cover bg-neutral-800 border border-neutral-700 shadow-md"
                onerror="this.onerror=null; this.src='/img/logo.png';"
              >
              <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-neutral-900 flex items-center justify-center" title="Verified Portal">
                <span class="w-1.5 h-1.5 bg-white rounded-full"></span>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h1 class="text-xl sm:text-2xl font-bold text-white truncate tracking-tight">${escapeHtml(guildName)}</h1>
              </div>
              <p class="text-xs sm:text-sm text-neutral-400 mt-1 flex items-center gap-1.5">
                <span class="text-[#5865F2] font-semibold">Official Sanction Appeal Portal</span>
              </p>
            </div>
          </div>

          ${!user ? `
            <!-- Unauthenticated State -->
            <div class="flex flex-col items-center text-center py-6 px-2 gap-4">
              <div class="w-14 h-14 rounded-2xl bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20 flex items-center justify-center">
                ${SVGS.scale}
              </div>
              <div>
                <h2 class="text-lg font-semibold text-white tracking-tight">Discord Identity Verification Required</h2>
                <p class="text-sm text-neutral-300 max-w-md mt-1.5 leading-relaxed">
                  To ensure appeals are securely tied to your Discord account, please authorize with Discord. We only check your account ID and active sanctions.
                </p>
              </div>
              <button 
                type="button" 
                id="btn-appeal-login"
                class="w-full mt-2 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold text-sm transition-all shadow-lg shadow-[#5865F2]/25 active:scale-[0.98] cursor-pointer"
              >
                ${SVGS.discord}
                <span>Login with Discord to Continue</span>
              </button>
            </div>
          ` : `
            <!-- Authenticated Appeal Form -->
            <form id="appeal-form" class="flex flex-col gap-5 sm:gap-6">
              <!-- User Identity Pill -->
              <div class="flex items-center justify-between p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/80">
                <div class="flex items-center gap-3.5 min-w-0">
                  <img 
                    src="${user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : '/img/logo.png'}" 
                    class="w-11 h-11 rounded-xl object-cover bg-neutral-800 border border-neutral-700 shrink-0 shadow-sm" 
                    alt="${escapeHtml(user.username)}"
                    onerror="this.onerror=null; this.src='/img/logo.png';"
                  >
                  <div class="flex flex-col min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-semibold text-white truncate">${escapeHtml(user.global_name || user.username)}</span>
                      <span class="text-xs text-neutral-400 font-mono">@${escapeHtml(user.username)}</span>
                    </div>
                    <span class="text-xs text-neutral-400 font-mono truncate mt-0.5">ID: ${escapeHtml(user.id)}</span>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shrink-0">
                  ${SVGS.shieldCheck}
                  <span>Verified</span>
                </div>
              </div>

              <!-- Questionnaire Fields -->
              <div class="flex flex-col gap-4 sm:gap-5">
                ${questions.map((q, idx) => `
                  <div class="flex flex-col gap-2">
                    <label for="q-inp-${idx}" class="text-sm font-semibold text-white flex items-center justify-between">
                      <span>${escapeHtml(q.label)}</span>
                      ${q.required ? '<span class="text-xs text-amber-400 font-medium">Required</span>' : '<span class="text-xs text-neutral-400 font-normal">Optional</span>'}
                    </label>
                    <textarea 
                      id="q-inp-${idx}" 
                      data-qid="${escapeHtml(q.id || `q_${idx}`)}"
                      data-qlabel="${escapeHtml(q.label)}"
                      rows="4" 
                      ${q.required ? 'required' : ''}
                      placeholder="${escapeHtml(q.placeholder || 'Write your response here...')}" 
                      class="appeal-question-input w-full resize-none px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-white text-sm leading-relaxed placeholder:text-neutral-400 focus:outline-none focus:border-[#5865F2] focus:bg-neutral-800/90 focus:ring-2 focus:ring-[#5865F2]/25 transition-all shadow-sm" style="resize: none !important;"
                    ></textarea>
                  </div>
                `).join('')}
              </div>

              <!-- Privacy Notice -->
              <div class="flex items-start gap-3 p-4 rounded-xl bg-neutral-800/40 border border-neutral-700/60 text-xs sm:text-[13px] text-neutral-300">
                <span class="text-neutral-400 shrink-0 mt-0.5">${SVGS.clock}</span>
                <p class="leading-relaxed">
                  Your submission will be routed directly to the server's staff review channel. Decisions are typically made within a few days. Submitting false information will result in a permanent blacklist.
                </p>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                id="submit-appeal-btn" 
                class="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold text-sm transition-all shadow-lg shadow-[#5865F2]/25 active:scale-[0.98] cursor-pointer"
              >
                ${SVGS.send}
                <span>Submit Appeal Request</span>
              </button>
            </form>
          `}
        </div>
      `;

      loading.classList.add('hidden');
      content.classList.remove('hidden');

      // Login Button Hook
      const loginBtn = document.getElementById('btn-appeal-login');
      if (loginBtn) {
        loginBtn.onclick = () => {
          if (window.API && typeof API.login === 'function') {
            API.login(window.location.pathname);
          } else {
            window.location.href = `/api/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          }
        };
      }

      // Form Submit Hook
      const form = document.getElementById('appeal-form');
      if (form) {
        form.onsubmit = async (e) => {
          e.preventDefault();
          const btn = document.getElementById('submit-appeal-btn');
          btn.disabled = true;
          btn.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Submitting...`;

          // Collect answers
          const textareas = form.querySelectorAll('.appeal-question-input');
          const answers = {};
          let combinedReason = '';
          let combinedStatement = '';

          textareas.forEach((ta, idx) => {
            const val = ta.value.trim();
            const qid = ta.dataset.qid || `q_${idx}`;
            const label = ta.dataset.qlabel || `Question ${idx + 1}`;
            answers[qid] = val;
            if (idx === 0) combinedReason = val;
            else if (idx === 1) combinedStatement = val;
            else {
              combinedStatement += (combinedStatement ? '\n\n' : '') + `[${label}]: ${val}`;
            }
          });

          try {
            await API.submitAppeal(customUrl, {
              reason: combinedReason || 'No reason provided',
              statement: combinedStatement || combinedReason || 'No statement provided',
              answers: answers
            });

            if (window.Toast && Toast.success) {
              Toast.success('Appeal submitted successfully! Server staff has been notified.');
            }

            content.innerHTML = `
              <div class="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-12 shadow-2xl text-center flex flex-col items-center gap-4 animate-fade-in">
                <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  ${SVGS.check}
                </div>
                <h2 class="text-xl font-bold text-white tracking-tight">Appeal Successfully Submitted</h2>
                <p class="text-sm text-neutral-300 max-w-md leading-relaxed">
                  Your appeal has been safely delivered to the <span class="text-white font-semibold">${escapeHtml(guildName)}</span> moderation team. If the moderators accept your appeal, your sanction will be lifted immediately.
                </p>
                <div class="flex items-center gap-3 mt-4">
                  <a href="/" class="px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold transition-colors border border-neutral-700">
                    Return to Orbit
                  </a>
                </div>
              </div>
            `;
          } catch (err) {
            btn.disabled = false;
            btn.innerHTML = `${SVGS.send} <span>Submit Appeal Request</span>`;
            const msg = err.message || 'Failed to submit appeal. You may already have a pending review.';
            if (window.Toast && Toast.error) {
              Toast.error(msg);
            } else {
              alert(msg);
            }
          }
        };
      }
    } catch (err) {
      console.error('Failed to load appeal portal:', err);
      const loading = document.getElementById('appeal-loading');
      if (loading) {
        loading.innerHTML = `
          <div class="flex flex-col items-center justify-center p-8 text-center max-w-md">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mb-3">
              ${SVGS.alertCircle}
            </div>
            <h2 class="text-base font-bold text-white tracking-tight">Appeal Portal Not Found</h2>
            <p class="text-xs text-neutral-400 mt-1 mb-5">This appeal portal may be disabled or the vanity URL is invalid.</p>
            <a href="/" class="px-4 py-2 rounded-xl bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-700 transition-colors">Return Home</a>
          </div>
        `;
      }
    }
  };
})();
