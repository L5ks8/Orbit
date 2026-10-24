/**
 * Orbit Dashboard - Verification Tab (Verifizierung)
 * 1:1 PeakBot UI & Full End-to-End Functionality:
 * - Feature Header + Quick Setup Banner ("Start Setup")
 * - 4 Live Counter Chips (Systems, Deployed, Auto-kick, Questionnaire) + "View analytics" link
 * - Systems Grid with interactive System Cards (Toggle, Deploy/Resend, Edit, Delete) + "+ System erstellen" card
 * - 4-Step Quick Setup Wizard Modal (Step 1: Roles, Step 2: Channel & Mode, Step 3: Auto-kick & Questionnaire, Step 4: Review & Deploy)
 * - Full System Editor Modal with Live Discord Panel Preview, Questionnaire Builder, Image Upload & Custom Dropdowns
 */

DashboardTabs.Verification = async function(container, guildId) {
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-center p-16 text-neutral-500 text-sm">
        <svg class="animate-spin mr-3 text-neutral-400 w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Lade Verifizierung...
      </div>
    </div>
  `;

  try {
    const [configData, rawChannels, rawRoles] = await Promise.all([
      API.getConfig(guildId).catch(() => ({})),
      API.getChannels(guildId).catch(() => ([])),
      API.getRoles(guildId).catch(() => ([]))
    ]);

    const vCfg = configData?.config?.verify || configData?.verify || {};
    const allChs = (Array.isArray(rawChannels) && rawChannels.length > 0)
      ? rawChannels
      : (Array.isArray(configData?.channels) ? configData.channels : []);
    let textChannels = allChs.filter(c => !c.type || c.type === 'text' || c.type === 'news' || c.type === 0 || c.type === 5 || (typeof c.type === 'string' && c.type.includes('text')));
    const allRls = (Array.isArray(rawRoles) && rawRoles.length > 0)
      ? rawRoles
      : (Array.isArray(configData?.roles) ? configData.roles : []);
    let roles = allRls.filter(r => r.name !== '@everyone' && !r.managed);

    let systems = Array.isArray(vCfg.systems) ? JSON.parse(JSON.stringify(vCfg.systems)) : [];
    if (systems.length === 0 && (vCfg.role_id || vCfg.channel_id || vCfg.enabled)) {
      const tMins = Number(vCfg.timeout_minutes) || 0;
      systems.push({
        id: 'default',
        name: vCfg.embed_title || 'Server Verification',
        enabled: Boolean(vCfg.enabled),
        deployed: Boolean(vCfg.enabled && vCfg.channel_id),
        channel_id: String(vCfg.channel_id || ''),
        role_id: String(vCfg.role_id || ''),
        remove_role_id: String(vCfg.remove_role_id || ''),
        verification_type: vCfg.verification_type || 'captcha',
        timeout_action: vCfg.timeout_action || (tMins > 0 ? 'kick' : 'none'),
        timeout_minutes: tMins,
        questionnaire_enabled: Boolean(vCfg.questionnaire_enabled || vCfg.verification_type === 'questionnaire'),
        questions: Array.isArray(vCfg.questions) ? vCfg.questions : [],
        embed_title: vCfg.embed_title || 'Server Verification',
        embed_description: vCfg.embed_description || 'Click the button below to verify your account and gain access to the server.',
        embed_color: vCfg.embed_color || '#5865F2',
        embed_image: vCfg.embed_image || '/img/default_verify.png',
        button_label: vCfg.button_label || 'Verify',
        button_style: vCfg.button_style || 'success'
      });
    }

    // Ensure every system has a valid verification_type
    systems.forEach(s => {
      if (!s.verification_type || typeof s.verification_type !== 'string') {
        s.verification_type = vCfg.verification_type || 'captcha';
      }
      s.verification_type = String(s.verification_type).toLowerCase();
      if (!['oneclick', 'captcha', 'web_captcha', 'questionnaire'].includes(s.verification_type)) {
        s.verification_type = 'captcha';
      }
    });

    // Modal state
    let quickSetupOpen = false;
    let quickStep = 1;
    let quickSubmitting = false;
    let quickState = {
      verifiedRoleMode: 'create', // 'create' | 'existing'
      verifiedRoleName: 'Verified',
      verifiedRoleId: roles[0] ? String(roles[0].id) : '',
      unverifiedRoleMode: 'none', // 'none' | 'create' | 'existing'
      unverifiedRoleName: 'Unverified',
      unverifiedRoleId: '',
      channelMode: 'create', // 'create' | 'existing'
      channelName: 'verify',
      channelId: textChannels[0] ? String(textChannels[0].id) : '',
      lockChannels: true,
      verificationType: 'captcha', // 'oneclick' | 'captcha' | 'web_captcha' | 'questionnaire'
      timeoutAction: 'none', // 'none' | 'kick' | 'ban'
      timeoutMinutes: 0,
      questionnaireEnabled: false,
      questions: [
        { question: 'How did you find our server?', placeholder: 'Friends, TikTok, Discord discovery...', answer: '' },
        { question: 'Do you agree to follow our server rules?', placeholder: 'Type yes', answer: 'yes,ja' }
      ],
      embedTitle: 'Verification Required',
      embedDescription: 'Click the button below to verify your account and gain access to the server.',
      embedColor: '#5865F2',
      buttonLabel: 'Verify',
      buttonStyle: 'success'
    };

    let editorOpen = false;
    let editorSubmitting = false;
    let editingSystem = null;

    const MODE_META = {
      'oneclick': { label: 'One-Click', desc: 'Instant verify with a single tap', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      'captcha': { label: 'Discord CAPTCHA', desc: '5-character image challenge in Discord', badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
      'web_captcha': { label: 'Web CAPTCHA', desc: 'Browser challenge + IP protection', badgeClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
      'questionnaire': { label: 'Questionnaire', desc: 'Members answer custom questions in a modal', badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20' }
    };

    const COLOR_SWATCHES = [
      '#5865F2', '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
      '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#ffffff'
    ];

    async function persistSystems(silent = false) {
      try {
        await API.saveConfig(guildId, {
          verify: {
            systems
          }
        });
        if (!silent && window.Toast) Toast.success('Verifizierungs-Einstellungen gespeichert!');
      } catch (err) {
        if (window.Toast) Toast.error('Failed to save: ' + (err.message || err));
      }
    }

    function getChannelName(cid) {
      if (!cid) return 'Kein Kanal';
      const ch = textChannels.find(c => String(c.id) === String(cid));
      return ch ? `#${ch.name}` : `#${cid}`;
    }

    function getRoleObj(rid) {
      if (!rid) return null;
      return roles.find(r => String(r.id) === String(rid)) || null;
    }

    function syncEditingSystemFromDom() {
      if (!editingSystem) return;
      const nameIn = document.getElementById('ed-sys-name');
      if (nameIn) editingSystem.name = nameIn.value;
      const tMinsIn = document.getElementById('ed-timeout-mins');
      if (tMinsIn) editingSystem.timeout_minutes = Math.max(0, parseInt(tMinsIn.value, 10) || 0);
      const titleIn = document.getElementById('ed-embed-title');
      if (titleIn) editingSystem.embed_title = titleIn.value;
      const descIn = document.getElementById('ed-embed-desc');
      if (descIn) editingSystem.embed_description = descIn.value;
      const btnLblIn = document.getElementById('ed-btn-label');
      if (btnLblIn) editingSystem.button_label = btnLblIn.value;
      const colIn = document.getElementById('ed-embed-color');
      if (colIn) editingSystem.embed_color = colIn.value;
      const imgIn = document.getElementById('ed-embed-image');
      if (imgIn) editingSystem.embed_image = imgIn.value;

      const chInput = document.getElementById('ed-channel-select-input');
      if (chInput && chInput.value) editingSystem.channel_id = chInput.value;
      const vRoleInput = document.getElementById('ed-vrole-select-input');
      if (vRoleInput && vRoleInput.value) editingSystem.role_id = vRoleInput.value;
      const uRoleInput = document.getElementById('ed-urole-select-input');
      if (uRoleInput) editingSystem.remove_role_id = uRoleInput.value;
      const tActInput = document.getElementById('ed-timeout-action-select-input');
      if (tActInput && tActInput.value) editingSystem.timeout_action = tActInput.value;
      const btnStyleInput = document.getElementById('ed-btn-style-select-input');
      if (btnStyleInput && btnStyleInput.value) editingSystem.button_style = btnStyleInput.value;
    }

    function renderSystemCard(sys) {
      const modeInfo = MODE_META[sys.verification_type] || MODE_META.captcha;
      const isDeployed = Boolean(sys.deployed || (sys.enabled && sys.channel_id));
      const vRole = getRoleObj(sys.role_id);
      const uRole = getRoleObj(sys.remove_role_id);
      const hasAutoKick = sys.timeout_action && sys.timeout_action !== 'none' && Number(sys.timeout_minutes) > 0;
      const hasQuestionnaire = sys.verification_type === 'questionnaire' || (sys.questionnaire_enabled && Array.isArray(sys.questions) && sys.questions.length > 0);
      const toggleHtml = typeof window.renderToggle === 'function'
        ? window.renderToggle({ id: `verify-sys-toggle-${sys.id}`, checked: sys.enabled !== false })
        : '';

      return `
        <div class="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 flex flex-col justify-between gap-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] hover:border-neutral-700/80 transition-colors min-h-[180px]" data-sys-card="${escapeHtml(sys.id)}">
          <div>
            <!-- Card Header -->
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-semibold text-white truncate">${escapeHtml(sys.name || sys.embed_title || 'Verification System')}</h4>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                    isDeployed
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                  }">${isDeployed ? 'Deployed' : 'Draft'}</span>
                </div>
                <p class="text-[11px] text-neutral-500 truncate mt-0.5">${escapeHtml(sys.embed_description || '')}</p>
              </div>
              <div class="shrink-0" data-sys-toggle-wrap="${escapeHtml(sys.id)}">
                ${toggleHtml}
              </div>
            </div>

            <!-- Metadata Pills -->
            <div class="flex flex-wrap items-center gap-1.5 mt-3">
              <!-- Interactive Mode Selector on Card -->
              <div class="relative inline-block text-left" data-sys-mode-container="${escapeHtml(sys.id)}">
                <button type="button" data-sys-mode-trigger="${escapeHtml(sys.id)}" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${modeInfo.badgeClass} hover:brightness-125 transition-all cursor-pointer select-none" title="Click to change verification method">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-3 h-3"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
                  <span>${escapeHtml(modeInfo.label)}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-2.5 h-2.5 opacity-70"><path d="m6 9 6 6 6-6"></path></svg>
                </button>
                <div id="sys-mode-menu-${escapeHtml(sys.id)}" class="hidden absolute left-0 top-full mt-1.5 z-40 w-52 rounded-xl bg-neutral-900 border border-neutral-700 shadow-2xl p-1.5 space-y-1">
                  <div class="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-800">Choose method</div>
                  ${Object.entries(MODE_META).map(([mKey, mMeta]) => `
                    <button type="button" data-sys-set-mode="${escapeHtml(sys.id)}" data-mode-key="${mKey}" class="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      sys.verification_type === mKey ? 'bg-indigo-500/15 text-indigo-300 font-semibold' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                    }">
                      <div class="min-w-0 pr-2">
                        <div class="truncate">${escapeHtml(mMeta.label)}</div>
                        <div class="text-[10px] text-neutral-500 font-normal truncate">${escapeHtml(mMeta.desc)}</div>
                      </div>
                      ${sys.verification_type === mKey ? '<svg class="w-3.5 h-3.5 text-indigo-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"></path></svg>' : ''}
                    </button>
                  `).join('')}
                </div>
              </div>

              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-neutral-800/80 text-neutral-300 border border-neutral-700/70">
                ${escapeHtml(getChannelName(sys.channel_id))}
              </span>

              ${vRole ? `
                <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-neutral-800/80 text-neutral-200 border border-neutral-700/70">
                  <span class="w-2 h-2 rounded-full" style="background-color:${escapeHtml(vRole.color && vRole.color !== '#000000' ? vRole.color : '#22c55e')}"></span>
                  @${escapeHtml(vRole.name)}
                </span>
              ` : `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Keine Rolle
                </span>
              `}

              ${uRole ? `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-neutral-800/60 text-neutral-400 border border-neutral-800" title="Removed upon verification">
                  -@${escapeHtml(uRole.name)}
                </span>
              ` : ''}

              ${hasAutoKick ? `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Auto-${sys.timeout_action === 'ban' ? 'Ban' : 'Kick'}: ${Number(sys.timeout_minutes)}m
                </span>
              ` : ''}

              ${hasQuestionnaire ? `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  ${(sys.questions || []).length || 1} questions
                </span>
              ` : ''}
            </div>
          </div>

          <!-- Card Footer Actions -->
          <div class="flex items-center justify-between gap-2 pt-3 border-t border-neutral-800/80">
            <button type="button" data-sys-deploy="${escapeHtml(sys.id)}" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-medium text-white transition-all active:scale-95 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-3.5 h-3.5 text-emerald-400"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
              ${isDeployed ? 'Resend panel' : 'Deploy Panel'}
            </button>
            <div class="flex items-center gap-1">
              <button type="button" data-sys-edit="${escapeHtml(sys.id)}" class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer" title="Edit system">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-2 w-4 h-4"><path d="M20 7h-9"></path><path d="M14 17H5"></path><circle cx="17" cy="17" r="3"></circle><circle cx="7" cy="7" r="3"></circle></svg>
              </button>
              <button type="button" data-sys-delete="${escapeHtml(sys.id)}" class="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer" title="Delete system">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2 w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function renderQuickSetupModal() {
      if (!quickSetupOpen) return '';
      const stepSubtitles = {
        1: 'Step 1 of 4 — Roles',
        2: 'Step 2 of 4 — Channel & Mode',
        3: 'Step 3 of 4 — Auto-kick & Questionnaire',
        4: 'Step 4 of 4 — Review & Deploy'
      };

      const roleOpts = roles.map(r => ({ value: String(r.id), label: `@ ${r.name}` }));
      const channelOpts = textChannels.map(c => ({ value: String(c.id), label: `# ${c.name}` }));

      let stepBodyHtml = '';
      if (quickStep === 1) {
        stepBodyHtml = `
          <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            <div class="mb-3">
              <div class="text-sm font-medium text-white">
                <span class="inline-flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check w-4 h-4 text-emerald-400"><path d="M20 6 9 17l-5-5"></path></svg>Verified role
                </span>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button type="button" data-qs-vrole-mode="create" class="text-left px-3 py-2.5 rounded-xl border transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer ${
                quickState.verifiedRoleMode === 'create'
                  ? 'border-indigo-500/40 bg-indigo-500/5'
                  : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800/50'
              }">
                <div class="text-xs font-medium ${quickState.verifiedRoleMode === 'create' ? 'text-white' : 'text-neutral-300'}">Create new</div>
                <div class="text-[10px] text-neutral-500 mt-0.5">Bot makes it for you</div>
              </button>
              <button type="button" data-qs-vrole-mode="existing" class="text-left px-3 py-2.5 rounded-xl border transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer ${
                quickState.verifiedRoleMode === 'existing'
                  ? 'border-indigo-500/40 bg-indigo-500/5'
                  : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800/50'
              }">
                <div class="text-xs font-medium ${quickState.verifiedRoleMode === 'existing' ? 'text-white' : 'text-neutral-300'}">Use existing</div>
                <div class="text-[10px] text-neutral-500 mt-0.5">Pick from your roles</div>
              </button>
            </div>
            ${quickState.verifiedRoleMode === 'create' ? `
              <div class="mt-3 pt-3 border-t border-neutral-800/70">
                <label class="block text-[11px] text-neutral-400 mb-1">Role name</label>
                <input id="qs-vrole-name" type="text" maxlength="50" value="${escapeHtml(quickState.verifiedRoleName)}" placeholder="Verified" class="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600">
              </div>
            ` : `
              <div class="mt-3 pt-3 border-t border-neutral-800/70">
                <label class="block text-[11px] text-neutral-400 mb-1">Select role</label>
                ${window.renderCustomSelect ? window.renderCustomSelect({
                  id: 'qs-vrole-select',
                  options: roleOpts,
                  value: quickState.verifiedRoleId,
                  placeholder: 'Select role...',
                  onChange: (v) => { quickState.verifiedRoleId = v; }
                }) : ''}
              </div>
            `}
          </div>

          <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            <div class="mb-3">
              <div class="text-sm font-medium text-white">
                <span class="inline-flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-4 h-4 text-red-400"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>Unverified role
                </span>
              </div>
              <p class="text-[11px] text-neutral-500 mt-0.5 leading-snug">Optional. Most servers don't need one — new members simply see only the verify channel until they verify.</p>
            </div>
            <div class="grid grid-cols-3 gap-2">
              <button type="button" data-qs-urole-mode="none" class="text-left px-3 py-2.5 rounded-xl border transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer ${
                quickState.unverifiedRoleMode === 'none'
                  ? 'border-indigo-500/40 bg-indigo-500/5'
                  : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800/50'
              }">
                <div class="text-xs font-medium ${quickState.unverifiedRoleMode === 'none' ? 'text-white' : 'text-neutral-300'}">None</div>
                <div class="text-[10px] text-neutral-500 mt-0.5">Recommended</div>
              </button>
              <button type="button" data-qs-urole-mode="create" class="text-left px-3 py-2.5 rounded-xl border transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer ${
                quickState.unverifiedRoleMode === 'create'
                  ? 'border-indigo-500/40 bg-indigo-500/5'
                  : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800/50'
              }">
                <div class="text-xs font-medium ${quickState.unverifiedRoleMode === 'create' ? 'text-white' : 'text-neutral-300'}">Create new</div>
                <div class="text-[10px] text-neutral-500 mt-0.5">Bot makes it for you</div>
              </button>
              <button type="button" data-qs-urole-mode="existing" class="text-left px-3 py-2.5 rounded-xl border transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 cursor-pointer ${
                quickState.unverifiedRoleMode === 'existing'
                  ? 'border-indigo-500/40 bg-indigo-500/5'
                  : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800/50'
              }">
                <div class="text-xs font-medium ${quickState.unverifiedRoleMode === 'existing' ? 'text-white' : 'text-neutral-300'}">Use existing</div>
                <div class="text-[10px] text-neutral-500 mt-0.5">Pick from your roles</div>
              </button>
            </div>
            ${quickState.unverifiedRoleMode === 'create' ? `
              <div class="mt-3 pt-3 border-t border-neutral-800/70">
                <label class="block text-[11px] text-neutral-400 mb-1">Unverified role name</label>
                <input id="qs-urole-name" type="text" maxlength="50" value="${escapeHtml(quickState.unverifiedRoleName)}" placeholder="Unverified" class="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600">
              </div>
            ` : quickState.unverifiedRoleMode === 'existing' ? `
              <div class="mt-3 pt-3 border-t border-neutral-800/70">
                <label class="block text-[11px] text-neutral-400 mb-1">Select unverified role</label>
                ${window.renderCustomSelect ? window.renderCustomSelect({
                  id: 'qs-urole-select',
                  options: roleOpts,
                  value: quickState.unverifiedRoleId,
                  placeholder: 'Select unverified role...',
                  onChange: (v) => { quickState.unverifiedRoleId = v; }
                }) : ''}
              </div>
            ` : ''}
          </div>
        `;
      } else if (quickStep === 2) {
        stepBodyHtml = `
          <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            <div class="mb-3">
              <div class="text-sm font-medium text-white">Verification channel</div>
              <p class="text-[11px] text-neutral-500 mt-0.5">Where the verification panel will be posted.</p>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button type="button" data-qs-ch-mode="create" class="text-left px-3 py-2.5 rounded-xl border transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.96] cursor-pointer ${
                quickState.channelMode === 'create'
                  ? 'border-indigo-500/40 bg-indigo-500/5'
                  : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800/50'
              }">
                <div class="text-xs font-medium ${quickState.channelMode === 'create' ? 'text-white' : 'text-neutral-300'}">Create #verify</div>
                <div class="text-[10px] text-neutral-500 mt-0.5">Bot sets permissions</div>
              </button>
              <button type="button" data-qs-ch-mode="existing" class="text-left px-3 py-2.5 rounded-xl border transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.96] cursor-pointer ${
                quickState.channelMode === 'existing'
                  ? 'border-indigo-500/40 bg-indigo-500/5'
                  : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800/50'
              }">
                <div class="text-xs font-medium ${quickState.channelMode === 'existing' ? 'text-white' : 'text-neutral-300'}">Use existing</div>
                <div class="text-[10px] text-neutral-500 mt-0.5">Pick from your channels</div>
              </button>
            </div>
            ${quickState.channelMode === 'create' ? `
              <div class="mt-3 pt-3 border-t border-neutral-800/70">
                <label class="block text-[11px] text-neutral-400 mb-1">Channel name</label>
                <input id="qs-ch-name" type="text" maxlength="40" value="${escapeHtml(quickState.channelName)}" placeholder="verify" class="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600">
              </div>
            ` : `
              <div class="mt-3 pt-3 border-t border-neutral-800/70">
                <label class="block text-[11px] text-neutral-400 mb-1">Select channel</label>
                ${window.renderCustomSelect ? window.renderCustomSelect({
                  id: 'qs-ch-select',
                  options: channelOpts,
                  value: quickState.channelId,
                  placeholder: 'Select channel...',
                  onChange: (v) => { quickState.channelId = v; }
                }) : ''}
              </div>
            `}
          </div>

          <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            <div class="mb-3">
              <div class="text-sm font-medium text-white">Verification challenge mode</div>
              <p class="text-[11px] text-neutral-500 mt-0.5">Choose how new members verify their account.</p>
            </div>
            <div class="grid grid-cols-2 gap-2">
              ${Object.entries(MODE_META).map(([key, m]) => `
                <button type="button" data-qs-vtype="${key}" class="text-left px-3 py-2.5 rounded-xl border transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.96] cursor-pointer ${
                  quickState.verificationType === key
                    ? 'border-indigo-500/40 bg-indigo-500/5'
                    : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800/50'
                }">
                  <div class="text-xs font-medium ${quickState.verificationType === key ? 'text-white' : 'text-neutral-300'}">${escapeHtml(m.label)}</div>
                  <div class="text-[10px] text-neutral-500 mt-0.5 leading-snug">${escapeHtml(m.desc)}</div>
                </button>
              `).join('')}
            </div>
          </div>
        `;
      } else if (quickStep === 3) {
        const kickPresets = [
          { mins: 0, label: 'Disabled', sub: 'No timeout' },
          { mins: 10, label: '10 mins', sub: 'Fast raid protection' },
          { mins: 30, label: '30 mins', sub: 'Recommended' },
          { mins: 60, label: '1 hour', sub: 'Relaxed' }
        ];
        stepBodyHtml = `
          <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            <div class="mb-3">
              <div class="text-sm font-medium text-white">Auto-kick unverified members</div>
              <p class="text-[11px] text-neutral-500 mt-0.5">Automatically kick members who don't verify in time.</p>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              ${kickPresets.map(p => {
                const active = (Number(quickState.timeoutMinutes) || 0) === p.mins;
                return `
                  <button type="button" data-qs-kick="${p.mins}" class="text-left px-3 py-2.5 rounded-xl border transition-[transform,background-color,border-color] duration-150 ease-out active:scale-[0.96] cursor-pointer ${
                    active
                      ? 'border-indigo-500/40 bg-indigo-500/5'
                      : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700 hover:bg-neutral-800/50'
                  }">
                    <div class="text-xs font-medium ${active ? 'text-white' : 'text-neutral-300'}">${p.label}</div>
                    <div class="text-[10px] text-neutral-500 mt-0.5">${p.sub}</div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            <div class="flex items-center justify-between gap-3 mb-2">
              <div>
                <div class="text-sm font-medium text-white">Questionnaire</div>
                <p class="text-[11px] text-neutral-500">Ask short questions in a Discord modal before granting access.</p>
              </div>
              <button type="button" id="qs-toggle-questionnaire" class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                quickState.questionnaireEnabled || quickState.verificationType === 'questionnaire'
                  ? 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
              }">
                ${quickState.questionnaireEnabled || quickState.verificationType === 'questionnaire' ? 'Enabled' : 'Enable'}
              </button>
            </div>
            ${(quickState.questionnaireEnabled || quickState.verificationType === 'questionnaire') ? `
              <div class="space-y-2 mt-3 pt-3 border-t border-neutral-800/70">
                ${quickState.questions.map((q, idx) => `
                  <div class="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <div class="flex items-center justify-between gap-2">
                      <span class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Question ${idx + 1}</span>
                      ${quickState.questions.length > 1 ? `<button type="button" data-qs-del-q="${idx}" class="text-[10px] text-red-400 hover:underline cursor-pointer">Remove</button>` : ''}
                    </div>
                    <input type="text" data-qs-q-label="${idx}" value="${escapeHtml(q.question)}" placeholder="Question text..." class="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none">
                    <input type="text" data-qs-q-ans="${idx}" value="${escapeHtml(q.answer || '')}" placeholder="Expected answer (optional, comma-separated, leave blank for any)" class="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 focus:outline-none">
                  </div>
                `).join('')}
                ${quickState.questions.length < 5 ? `
                  <button type="button" id="qs-add-q-btn" class="w-full py-1.5 rounded-lg border border-dashed border-neutral-700 text-xs text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors cursor-pointer">+ Add Question</button>
                ` : ''}
              </div>
            ` : ''}
          </div>
        `;
      } else {
        stepBodyHtml = `
          <div class="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
            <div>
              <label class="block text-[11px] font-medium text-neutral-400 mb-1">Panel Title</label>
              <input id="qs-embed-title" type="text" maxlength="100" value="${escapeHtml(quickState.embedTitle)}" class="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600">
            </div>
            <div>
              <label class="block text-[11px] font-medium text-neutral-400 mb-1">Panel Description</label>
              <textarea id="qs-embed-desc" rows="2" data-no-autoresize="true" class="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600 resize-none">${escapeHtml(quickState.embedDescription)}</textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-medium text-neutral-400 mb-1">Button Text</label>
                <input id="qs-btn-label" type="text" maxlength="40" value="${escapeHtml(quickState.buttonLabel)}" class="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600">
              </div>
              <div>
                <label class="block text-[11px] font-medium text-neutral-400 mb-1">Embed Color</label>
                <input id="qs-embed-color" type="text" maxlength="20" value="${escapeHtml(quickState.embedColor)}" class="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white font-mono focus:outline-none focus:border-neutral-600">
              </div>
            </div>
          </div>

          <div class="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-2 text-xs">
            <div class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Setup Summary</div>
            <div class="flex justify-between"><span class="text-neutral-500">Verified Role:</span><span class="text-white font-medium">${quickState.verifiedRoleMode === 'create' ? `Create @${escapeHtml(quickState.verifiedRoleName || 'Verified')}` : escapeHtml(getRoleObj(quickState.verifiedRoleId)?.name || 'Selected role')}</span></div>
            <div class="flex justify-between"><span class="text-neutral-500">Unverified Role:</span><span class="text-white font-medium">${quickState.unverifiedRoleMode === 'none' ? 'None' : quickState.unverifiedRoleMode === 'create' ? `Create @${escapeHtml(quickState.unverifiedRoleName || 'Unverified')}` : escapeHtml(getRoleObj(quickState.unverifiedRoleId)?.name || 'Selected role')}</span></div>
            <div class="flex justify-between"><span class="text-neutral-500">Channel:</span><span class="text-white font-medium">${quickState.channelMode === 'create' ? `Create #${escapeHtml(quickState.channelName || 'verify')}` : escapeHtml(getChannelName(quickState.channelId))}</span></div>
            <div class="flex justify-between"><span class="text-neutral-500">Challenge Mode:</span><span class="text-indigo-400 font-medium">${escapeHtml((MODE_META[quickState.verificationType] || MODE_META.captcha).label)}</span></div>
          </div>
        `;
      }

      return `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div id="qs-modal-backdrop" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div class="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
            <div class="px-6 pt-6 pb-4 border-b border-neutral-800 flex-shrink-0">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket w-5 h-5 text-neutral-300"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>
                </div>
                <div class="min-w-0">
                  <h3 class="text-base font-semibold text-white">Quick Setup</h3>
                  <p class="text-xs text-neutral-500">${stepSubtitles[quickStep]}</p>
                </div>
              </div>
              <div class="flex items-center gap-1.5">
                ${[1, 2, 3, 4].map(s => `
                  <div class="flex-1 h-1 rounded-full transition-colors ${s <= quickStep ? 'bg-neutral-400' : 'bg-neutral-800'}"></div>
                `).join('')}
              </div>
            </div>

            <div class="flex-1 overflow-y-auto min-h-0 px-6 py-5 space-y-4">
              ${stepBodyHtml}
            </div>

            <div class="flex items-center gap-3 px-6 py-4 border-t border-neutral-800 flex-shrink-0">
              <button id="qs-cancel-btn" type="button" class="h-10 px-4 rounded-xl border border-neutral-700 text-sm font-medium text-white hover:bg-neutral-800 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer">
                ${quickStep > 1 ? 'Back' : 'Cancel'}
              </button>
              <div class="flex-1"></div>
              <button id="qs-next-btn" type="button" ${quickSubmitting ? 'disabled' : ''} class="h-10 px-4 rounded-xl bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer">
                ${quickStep < 4 ? `
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-3.5 h-3.5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                ` : (quickSubmitting ? 'Deploying...' : `
                  Deploy Setup
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap w-3.5 h-3.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                `)}
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function renderSystemEditorModal() {
      if (!editorOpen || !editingSystem) return '';
      const sys = editingSystem;
      const roleOpts = roles.map(r => ({ value: String(r.id), label: `@ ${r.name}` }));
      const roleOptsWithNone = [{ value: '', label: 'Keine (Deaktiviert)' }, ...roleOpts];
      const channelOpts = textChannels.map(c => ({ value: String(c.id), label: `# ${c.name}` }));

      const btnColors = {
        success: 'bg-[#248046] hover:bg-[#1a6334] text-white',
        primary: 'bg-[#5865F2] hover:bg-[#4752C4] text-white',
        secondary: 'bg-[#4e5058] hover:bg-[#6d6f78] text-white',
        danger: 'bg-[#da373c] hover:bg-[#a1282c] text-white'
      };

      return `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div class="w-full max-w-4xl max-h-[90vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 flex-shrink-0">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-4 h-4"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
                </div>
                <div class="min-w-0">
                  <h3 class="text-sm font-semibold text-white truncate">Verifizierungs-System konfigurieren</h3>
                  <p class="text-[11px] text-neutral-500">Passe Rollen, Modus, Auto-Kick, Fragebogen und das Discord-Embed an</p>
                </div>
              </div>
              <button id="sys-editor-close" type="button" class="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x w-4 h-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
              </button>
            </div>

            <!-- Modal Body (2 Columns on Desktop) -->
            <div class="flex-1 overflow-y-auto min-h-0 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              <!-- Left Column: Settings (7 cols) -->
              <div class="lg:col-span-7 space-y-5">
                <!-- Name & Mode -->
                <div class="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 space-y-3">
                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1">System-Name</label>
                    <input id="ed-sys-name" type="text" maxlength="60" value="${escapeHtml(sys.name || 'Verification System')}" class="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600">
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-neutral-300 mb-1.5">Verifizierungs-Methode</label>
                    <div class="grid grid-cols-2 gap-2">
                      ${Object.entries(MODE_META).map(([key, m]) => `
                        <button type="button" data-ed-vtype="${key}" class="text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          sys.verification_type === key
                            ? 'border-indigo-500 bg-indigo-500/10 text-white ring-1 ring-indigo-500/30'
                            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
                        }">
                          <div class="text-xs font-semibold text-white flex items-center justify-between">
                            <span>${escapeHtml(m.label)}</span>
                            ${sys.verification_type === key ? '<span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-normal">Aktiv</span>' : ''}
                          </div>
                          <div class="text-[10px] text-neutral-500 mt-1 leading-snug">${escapeHtml(m.desc)}</div>
                        </button>
                      `).join('')}
                    </div>
                  </div>
                </div>

                <!-- Channel & Roles -->
                <div class="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 space-y-3">
                  <div class="text-xs font-semibold text-white">Kanal & Rollen</div>
                  <div>
                    <label class="block text-[11px] text-neutral-400 mb-1">Verifizierungs-Kanal</label>
                    ${window.renderCustomSelect ? window.renderCustomSelect({
                      id: 'ed-channel-select',
                      options: channelOpts,
                      value: String(sys.channel_id || ''),
                      placeholder: 'Select channel...',
                      onChange: (v) => { editingSystem.channel_id = v; }
                    }) : ''}
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[11px] text-neutral-400 mb-1">Verifizierte Rolle (wird vergeben)</label>
                      ${window.renderCustomSelect ? window.renderCustomSelect({
                        id: 'ed-vrole-select',
                        options: roleOpts,
                        value: String(sys.role_id || ''),
                        placeholder: 'Select role...',
                        onChange: (v) => { editingSystem.role_id = v; }
                      }) : ''}
                    </div>
                    <div>
                      <label class="block text-[11px] text-neutral-400 mb-1">Unverifizierte Rolle (wird entfernt)</label>
                      ${window.renderCustomSelect ? window.renderCustomSelect({
                        id: 'ed-urole-select',
                        options: roleOptsWithNone,
                        value: String(sys.remove_role_id || ''),
                        placeholder: 'Keine (Optional)',
                        onChange: (v) => { editingSystem.remove_role_id = v; }
                      }) : ''}
                    </div>
                  </div>
                </div>

                <!-- Auto-Kick & Questionnaire -->
                <div class="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 space-y-3">
                  <div class="text-xs font-semibold text-white">Auto-Kick & Fragebogen</div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[11px] text-neutral-400 mb-1">Timeout-Aktion</label>
                      ${window.renderCustomSelect ? window.renderCustomSelect({
                        id: 'ed-timeout-action-select',
                        options: [
                          { value: 'none', label: 'Keine Aktion (Deaktiviert)' },
                          { value: 'kick', label: 'Mitglied kicken (Auto-Kick)' },
                          { value: 'ban', label: 'Mitglied bannen (Auto-Ban)' }
                        ],
                        value: String(sys.timeout_action || 'none'),
                        placeholder: 'Select action...',
                        onChange: (v) => {
                          editingSystem.timeout_action = v;
                          if (v !== 'none' && (!editingSystem.timeout_minutes || Number(editingSystem.timeout_minutes) <= 0)) {
                            editingSystem.timeout_minutes = 10;
                            const mIn = document.getElementById('ed-timeout-mins');
                            if (mIn) mIn.value = '10';
                          }
                        }
                      }) : ''}
                    </div>
                    <div>
                      <label class="block text-[11px] text-neutral-400 mb-1">Zeitlimit (Minuten)</label>
                      <input id="ed-timeout-mins" type="number" min="0" max="10080" value="${Number(sys.timeout_minutes) || 0}" class="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600">
                    </div>
                  </div>

                  <!-- Questionnaire Section -->
                  <div class="pt-2 border-t border-neutral-800/80">
                    <div class="flex items-center justify-between mb-2">
                      <div>
                        <span class="text-xs font-medium text-white">Fragebogen (Questionnaire)</span>
                        <p class="text-[10px] text-neutral-500">Fragen im Discord-Modal vor der Verifizierung stellen</p>
                      </div>
                      <button type="button" id="ed-add-question-btn" class="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-medium text-white transition-colors cursor-pointer">+ Add question</button>
                    </div>
                    <div class="space-y-2">
                      ${(sys.questions || []).map((q, idx) => `
                        <div class="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                          <div class="flex items-center justify-between">
                            <span class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Frage ${idx + 1}</span>
                            <button type="button" data-ed-del-q="${idx}" class="text-[10px] text-red-400 hover:underline cursor-pointer">Entfernen</button>
                          </div>
                          <input type="text" data-ed-q-text="${idx}" value="${escapeHtml(q.question || '')}" placeholder="Frage eingeben..." class="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none">
                          <input type="text" data-ed-q-ans="${idx}" value="${escapeHtml(q.answer || '')}" placeholder="Erwartete Antwort (optional, Komma-getrennt, leer = jede Antwort)" class="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 focus:outline-none">
                        </div>
                      `).join('')}
                      ${(!sys.questions || sys.questions.length === 0) ? `
                        <p class="text-[11px] text-neutral-500 italic">Noch keine Fragen konfiguriert.</p>
                      ` : ''}
                    </div>
                  </div>
                </div>

                <!-- Panel Embed Settings -->
                <div class="rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 space-y-3">
                  <div class="text-xs font-semibold text-white">Discord Panel Design</div>
                  <div>
                    <label class="block text-[11px] text-neutral-400 mb-1">Embed-Titel</label>
                    <input id="ed-embed-title" type="text" maxlength="120" value="${escapeHtml(sys.embed_title || '')}" class="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600">
                  </div>
                  <div>
                    <label class="block text-[11px] text-neutral-400 mb-1">Embed-Beschreibung</label>
                    <textarea id="ed-embed-desc" rows="3" data-no-autoresize="true" class="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600 resize-none">${escapeHtml(sys.embed_description || '')}</textarea>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[11px] text-neutral-400 mb-1">Button-Text</label>
                      <input id="ed-btn-label" type="text" maxlength="50" value="${escapeHtml(sys.button_label || 'Verify')}" class="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-neutral-600">
                    </div>
                    <div>
                      <label class="block text-[11px] text-neutral-400 mb-1">Button-Stil</label>
                      ${window.renderCustomSelect ? window.renderCustomSelect({
                        id: 'ed-btn-style-select',
                        options: [
                          { value: 'success', label: 'Green (Success)' },
                          { value: 'primary', label: 'Blurple (Primary)' },
                          { value: 'secondary', label: 'Grau (Secondary)' },
                          { value: 'danger', label: 'Rot (Danger)' }
                        ],
                        value: String(sys.button_style || 'success'),
                        placeholder: 'Select style...',
                        onChange: (v) => {
                          editingSystem.button_style = v;
                          const prev = document.getElementById('ed-preview-btn');
                          if (prev) {
                            prev.className = 'inline-flex items-center justify-center px-4 py-1.5 rounded text-xs font-medium transition-colors ' + (btnColors[v] || btnColors.success);
                          }
                        }
                      }) : ''}
                    </div>
                  </div>
                  <div>
                    <label class="block text-[11px] text-neutral-400 mb-1.5">Embed-Farbe</label>
                    <div class="flex flex-wrap items-center gap-1.5">
                      ${COLOR_SWATCHES.map(c => `
                        <button type="button" data-ed-color="${c}" class="w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                          (sys.embed_color || '').toLowerCase() === c.toLowerCase() ? 'scale-125 border-white ring-2 ring-white/30' : 'border-black/30 hover:scale-110'
                        }" style="background-color:${c}"></button>
                      `).join('')}
                      <input id="ed-embed-color" type="text" value="${escapeHtml(sys.embed_color || '#5865F2')}" class="ml-auto w-24 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white font-mono focus:outline-none">
                    </div>
                  </div>
                  <div>
                    <label class="block text-[11px] text-neutral-400 mb-1">Banner-Bild URL (oder Upload)</label>
                    <div class="flex items-center gap-2">
                      <input id="ed-embed-image" type="text" value="${escapeHtml(sys.embed_image || '')}" placeholder="https://... oder /img/default_verify.png (oder 'none')" class="flex-1 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none">
                      <label class="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs text-neutral-200 cursor-pointer shrink-0">
                        Upload
                        <input id="ed-image-upload" type="file" accept="image/*" class="hidden">
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Live Discord Preview (5 cols) -->
              <div class="lg:col-span-5">
                <div class="sticky top-0 space-y-2">
                  <div class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Live Discord-Vorschau</div>
                  <div class="rounded-2xl bg-[#313338] border border-neutral-800 p-4 text-[#dbdee1] font-sans shadow-inner">
                    <div class="flex items-start gap-3">
                      <img src="/img/logo.png" alt="Orbit" class="w-9 h-9 rounded-full object-cover shrink-0">
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5">
                          <span class="text-[13px] font-semibold text-white">Orbit</span>
                          <span class="px-1 py-0.2 rounded text-[9px] font-bold bg-[#5865F2] text-white uppercase">APP</span>
                          <span class="text-[10px] text-[#949ba4] ml-1">Heute um 14:20 Uhr</span>
                        </div>
                        <div id="ed-preview-embed" class="mt-1.5 rounded bg-[#2b2d31] border-l-4 p-3 space-y-1.5" style="border-left-color: ${escapeHtml(sys.embed_color || '#5865F2')}">
                          <div id="ed-preview-title" class="text-sm font-semibold text-white break-words">${escapeHtml(sys.embed_title || 'Server Verification')}</div>
                          <div id="ed-preview-desc" class="text-xs text-[#dbdee1] whitespace-pre-wrap break-words leading-relaxed">${escapeHtml(sys.embed_description || '')}</div>
                          ${sys.embed_image && sys.embed_image !== 'none' ? `
                            <img id="ed-preview-img" src="${escapeHtml(sys.embed_image)}" alt="" class="mt-2 rounded-lg max-h-36 w-full object-cover" onerror="this.style.display='none'">
                          ` : ''}
                        </div>
                        <div class="mt-2">
                          <button type="button" id="ed-preview-btn" class="inline-flex items-center justify-center px-4 py-1.5 rounded text-xs font-medium transition-colors ${btnColors[sys.button_style] || btnColors.success}">
                            ${escapeHtml(sys.button_label || 'Verify')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-between gap-3 px-6 py-4 border-t border-neutral-800 flex-shrink-0">
              <button id="sys-editor-cancel" type="button" class="h-10 px-4 rounded-xl border border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">Cancel</button>
              <div class="flex items-center gap-2.5">
                <button id="sys-editor-save" type="button" ${editorSubmitting ? 'disabled' : ''} class="h-10 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold text-white transition-all cursor-pointer">
                  Save only
                </button>
                <button id="sys-editor-deploy" type="button" ${editorSubmitting ? 'disabled' : ''} class="h-10 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send w-3.5 h-3.5"><path d="m22 2-7 20-4-9-9-4Z"></path><path d="M22 2 11 13"></path></svg>
                  ${editorSubmitting ? 'Sending...' : 'Save & Send Panel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function render() {
      const systemsCount = systems.length;
      const deployedCount = systems.filter(s => s.deployed || (s.enabled && s.channel_id)).length;
      const autoKickCount = systems.filter(s => s.timeout_action && s.timeout_action !== 'none' && Number(s.timeout_minutes) > 0).length;
      const questionnaireCount = systems.filter(s => s.verification_type === 'questionnaire' || (s.questionnaire_enabled && Array.isArray(s.questions) && s.questions.length > 0)).length;

      container.innerHTML = `
        <div>
          <!-- Feature Header -->
          <div data-tour="feature-header" class="scroll-mt-24">
            <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="flex items-center justify-center text-neutral-500 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check w-5 h-5"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path></svg>
                </span>
                <h1 class="text-base font-medium text-white truncate">Verifizierung</h1>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <!-- Quick Setup Banner -->
            <div class="mb-5 rounded-2xl border border-neutral-800 bg-neutral-900 px-5 py-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_14px_34px_-20px_rgba(0,0,0,0.9)]">
              <div class="flex flex-wrap items-center gap-3 sm:gap-4">
                <div class="flex-shrink-0 w-11 h-11 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket w-5 h-5 text-neutral-300"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>
                </div>
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <h3 class="text-base font-semibold text-white">Quick Setup</h3>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700 uppercase tracking-wide">Recommended</span>
                </div>
                <button id="verify-start-setup-btn" type="button" class="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 flex-shrink-0 w-full sm:w-auto cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap w-4 h-4"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>Start Setup
                </button>
              </div>
            </div>

            <!-- 4 Counter Chips + View analytics link -->
            <div class="flex flex-wrap items-center gap-3 mb-5">
              <div class="flex flex-wrap items-center gap-2.5 flex-1">
                <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span class="text-sm font-semibold tabular-nums text-indigo-400">${systemsCount}</span>
                  <span class="text-[11px] text-neutral-500">Systems</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span class="text-sm font-semibold tabular-nums text-emerald-400">${deployedCount}</span>
                  <span class="text-[11px] text-neutral-500">Deployed</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span class="text-sm font-semibold tabular-nums text-amber-400">${autoKickCount}</span>
                  <span class="text-[11px] text-neutral-500">Auto-kick</span>
                </div>
                <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span class="text-sm font-semibold tabular-nums text-blue-400">${questionnaireCount}</span>
                  <span class="text-[11px] text-neutral-500">Questionnaire</span>
                </div>
              </div>
              <a href="/dashboard/${guildId}/analytics" class="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors ml-auto">
                View analytics
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right w-3 h-3"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </a>
            </div>

            <!-- Systems Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              ${systems.map(sys => renderSystemCard(sys)).join('')}

              <button id="verify-create-sys-btn" type="button" class="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-neutral-800 hover:border-neutral-600 text-neutral-500 hover:text-neutral-300 transition-[transform,border-color,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 group min-h-[180px] cursor-pointer">
                <div class="p-3 rounded-xl bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700 group-hover:scale-110 transition-[transform,border-color] duration-150 ease-out">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus w-5 h-5"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                </div>
                <span class="text-sm font-medium">System erstellen</span>
              </button>
            </div>

            ${renderQuickSetupModal()}
            ${renderSystemEditorModal()}
          </div>
        </div>
      `;

      bindEvents();
    }

    function bindEvents() {
      // Quick Setup open button
      const startBtn = document.getElementById('verify-start-setup-btn');
      if (startBtn) {
        startBtn.onclick = () => {
          quickStep = 1;
          quickSetupOpen = true;
          render();
        };
      }

      // Create System button
      const createBtn = document.getElementById('verify-create-sys-btn');
      if (createBtn) {
        createBtn.onclick = () => {
          editingSystem = {
            id: 'sys_' + Math.random().toString(36).slice(2, 8),
            name: systems.length === 0 ? 'Main Verification' : `Verification #${systems.length + 1}`,
            enabled: true,
            deployed: false,
            channel_id: textChannels[0] ? String(textChannels[0].id) : '',
            role_id: roles[0] ? String(roles[0].id) : '',
            remove_role_id: '',
            verification_type: 'captcha',
            timeout_action: 'none',
            timeout_minutes: 0,
            questionnaire_enabled: false,
            questions: [],
            embed_title: 'Verification Required',
            embed_description: 'Click the button below to verify your account and gain access to the server.',
            embed_color: '#5865F2',
            embed_image: '/img/default_verify.png',
            button_label: 'Verify',
            button_style: 'success'
          };
          editorOpen = true;
          render();
        };
      }

      // System card toggles
      systems.forEach(sys => {
        const toggleEl = document.getElementById(`verify-sys-toggle-${sys.id}`);
        if (toggleEl) {
          toggleEl.onchange = async (e) => {
            sys.enabled = e.target.checked;
            await persistSystems(true);
            render();
          };
        }
      });

      // Mode dropdown toggle on system cards
      container.querySelectorAll('[data-sys-mode-trigger]').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const sysId = btn.getAttribute('data-sys-mode-trigger');
          const menu = document.getElementById(`sys-mode-menu-${sysId}`);
          if (!menu) return;
          const isHidden = menu.classList.contains('hidden');
          container.querySelectorAll('[id^="sys-mode-menu-"]').forEach(m => m.classList.add('hidden'));
          if (isHidden) menu.classList.remove('hidden');
        };
      });

      // Mode selection buttons on system cards
      container.querySelectorAll('[data-sys-set-mode]').forEach(btn => {
        btn.onclick = async (e) => {
          e.stopPropagation();
          const sysId = btn.getAttribute('data-sys-set-mode');
          const modeKey = btn.getAttribute('data-mode-key');
          const sys = systems.find(s => String(s.id) === String(sysId));
          if (!sys) return;
          sys.verification_type = modeKey;
          if (modeKey === 'questionnaire') {
            sys.questionnaire_enabled = true;
            if (!Array.isArray(sys.questions) || sys.questions.length === 0) {
              sys.questions = [{ question: 'Do you agree to follow our server rules?', placeholder: 'Type yes', answer: '' }];
            }
          }
          await persistSystems(true);
          const meta = MODE_META[modeKey] || MODE_META.captcha;
          if (window.Toast) Toast.success(`Modus auf "${meta.label}" gesetzt!`);
          render();
        };
      });

      // Hide card mode menus on outside click
      const onDocClick = (e) => {
        if (!e.target.closest('[data-sys-mode-container]')) {
          container.querySelectorAll('[id^="sys-mode-menu-"]').forEach(m => m.classList.add('hidden'));
        }
      };
      document.removeEventListener('click', onDocClick);
      document.addEventListener('click', onDocClick);

      // Deploy / Resend buttons on system cards
      container.querySelectorAll('[data-sys-deploy]').forEach(btn => {
        btn.onclick = async () => {
          const sysId = btn.getAttribute('data-sys-deploy');
          const sys = systems.find(s => String(s.id) === String(sysId));
          if (!sys) return;
          if (!sys.channel_id) {
            editingSystem = JSON.parse(JSON.stringify(sys));
            editorOpen = true;
            render();
            if (window.Toast) Toast.error('Please select a channel for this system first.');
            return;
          }
          const origHtml = btn.innerHTML;
          btn.disabled = true;
          btn.textContent = 'Sende...';
          try {
            const res = await API.sendVerifyPanel(guildId, {
              system_id: sys.id,
              channel_id: sys.channel_id,
              system: sys
            });
            if (Array.isArray(res?.systems)) {
              systems = res.systems;
            } else {
              sys.deployed = true;
              sys.enabled = true;
            }
            if (window.Toast) Toast.success('Verification panel posted to channel successfully!');
            render();
          } catch (err) {
            if (window.Toast) Toast.error('Failed to send: ' + (err.message || err));
            btn.disabled = false;
            btn.innerHTML = origHtml;
          }
        };
      });

      // Edit system buttons
      container.querySelectorAll('[data-sys-edit]').forEach(btn => {
        btn.onclick = () => {
          const sysId = btn.getAttribute('data-sys-edit');
          const sys = systems.find(s => String(s.id) === String(sysId));
          if (!sys) return;
          editingSystem = JSON.parse(JSON.stringify(sys));
          editorOpen = true;
          render();
        };
      });

      // Delete system buttons
      container.querySelectorAll('[data-sys-delete]').forEach(btn => {
        btn.onclick = async () => {
          const sysId = btn.getAttribute('data-sys-delete');
          const sys = systems.find(s => String(s.id) === String(sysId));
          const sysName = sys?.name || 'Rules Agreement';
          const confirmed = await window.confirmDelete({
            title: `Delete ${sysName}?`,
            message: 'This cannot be undone. The verification panel will no longer work.',
            confirmText: 'Delete',
            cancelText: 'Cancel'
          });
          if (!confirmed) return;
          systems = systems.filter(s => String(s.id) !== String(sysId));
          await persistSystems(false);
          render();
        };
      });

      // Quick Setup Modal bindings
      if (quickSetupOpen) {
        if (window.bindCustomSelects) {
          window.bindCustomSelects({
            'qs-vrole-select': (v) => { quickState.verifiedRoleId = v; },
            'qs-urole-select': (v) => { quickState.unverifiedRoleId = v; },
            'qs-ch-select': (v) => { quickState.channelId = v; }
          });
        }

        const backdrop = document.getElementById('qs-modal-backdrop');
        if (backdrop) {
          backdrop.onclick = () => {
            if (!quickSubmitting) {
              quickSetupOpen = false;
              render();
            }
          };
        }

        const cancelBtn = document.getElementById('qs-cancel-btn');
        if (cancelBtn) {
          cancelBtn.onclick = () => {
            if (quickStep > 1) {
              quickStep--;
              render();
            } else {
              quickSetupOpen = false;
              render();
            }
          };
        }

        // Step 1 controls
        container.querySelectorAll('[data-qs-vrole-mode]').forEach(b => {
          b.onclick = () => {
            quickState.verifiedRoleMode = b.getAttribute('data-qs-vrole-mode');
            render();
          };
        });
        container.querySelectorAll('[data-qs-urole-mode]').forEach(b => {
          b.onclick = () => {
            quickState.unverifiedRoleMode = b.getAttribute('data-qs-urole-mode');
            render();
          };
        });
        const vRoleNameIn = document.getElementById('qs-vrole-name');
        if (vRoleNameIn) vRoleNameIn.oninput = (e) => { quickState.verifiedRoleName = e.target.value; };
        const uRoleNameIn = document.getElementById('qs-urole-name');
        if (uRoleNameIn) uRoleNameIn.oninput = (e) => { quickState.unverifiedRoleName = e.target.value; };

        // Step 2 controls
        container.querySelectorAll('[data-qs-ch-mode]').forEach(b => {
          b.onclick = () => {
            quickState.channelMode = b.getAttribute('data-qs-ch-mode');
            render();
          };
        });
        const chNameIn = document.getElementById('qs-ch-name');
        if (chNameIn) chNameIn.oninput = (e) => { quickState.channelName = e.target.value; };
        container.querySelectorAll('[data-qs-vtype]').forEach(b => {
          b.onclick = () => {
            quickState.verificationType = b.getAttribute('data-qs-vtype');
            if (quickState.verificationType === 'questionnaire') {
              quickState.questionnaireEnabled = true;
            }
            render();
          };
        });

        // Step 3 controls
        container.querySelectorAll('[data-qs-kick]').forEach(b => {
          b.onclick = () => {
            const mins = Number(b.getAttribute('data-qs-kick')) || 0;
            quickState.timeoutMinutes = mins;
            quickState.timeoutAction = mins > 0 ? 'kick' : 'none';
            render();
          };
        });
        const toggleQBtn = document.getElementById('qs-toggle-questionnaire');
        if (toggleQBtn) {
          toggleQBtn.onclick = () => {
            quickState.questionnaireEnabled = !quickState.questionnaireEnabled;
            if (quickState.questionnaireEnabled && quickState.verificationType !== 'questionnaire') {
              quickState.verificationType = 'questionnaire';
            } else if (!quickState.questionnaireEnabled && quickState.verificationType === 'questionnaire') {
              quickState.verificationType = 'captcha';
            }
            render();
          };
        }
        container.querySelectorAll('[data-qs-q-label]').forEach(inp => {
          inp.oninput = (e) => {
            const idx = Number(inp.getAttribute('data-qs-q-label'));
            if (quickState.questions[idx]) quickState.questions[idx].question = e.target.value;
          };
        });
        container.querySelectorAll('[data-qs-q-ans]').forEach(inp => {
          inp.oninput = (e) => {
            const idx = Number(inp.getAttribute('data-qs-q-ans'));
            if (quickState.questions[idx]) quickState.questions[idx].answer = e.target.value;
          };
        });
        container.querySelectorAll('[data-qs-del-q]').forEach(btn => {
          btn.onclick = () => {
            const idx = Number(btn.getAttribute('data-qs-del-q'));
            quickState.questions.splice(idx, 1);
            render();
          };
        });
        const addQBtn = document.getElementById('qs-add-q-btn');
        if (addQBtn) {
          addQBtn.onclick = () => {
            if (quickState.questions.length < 5) {
              quickState.questions.push({ question: 'New question', placeholder: 'Your answer...', answer: '' });
              render();
            }
          };
        }

        // Step 4 controls
        const qsTitleIn = document.getElementById('qs-embed-title');
        if (qsTitleIn) qsTitleIn.oninput = (e) => { quickState.embedTitle = e.target.value; };
        const qsDescIn = document.getElementById('qs-embed-desc');
        if (qsDescIn) qsDescIn.oninput = (e) => { quickState.embedDescription = e.target.value; };
        const qsBtnLblIn = document.getElementById('qs-btn-label');
        if (qsBtnLblIn) qsBtnLblIn.oninput = (e) => { quickState.buttonLabel = e.target.value; };
        const qsColorIn = document.getElementById('qs-embed-color');
        if (qsColorIn) qsColorIn.oninput = (e) => { quickState.embedColor = e.target.value; };

        const nextBtn = document.getElementById('qs-next-btn');
        if (nextBtn) {
          nextBtn.onclick = async () => {
            if (quickStep < 4) {
              quickStep++;
              render();
              return;
            }
            // Deploy Quick Setup!
            quickSubmitting = true;
            render();
            try {
              const sysId = systems.length === 0 ? 'default' : ('sys_' + Math.random().toString(36).slice(2, 8));
              const res = await API.sendVerifyPanel(guildId, {
                create_verified_role: quickState.verifiedRoleMode === 'create',
                verified_role_name: quickState.verifiedRoleName || 'Verified',
                create_unverified_role: quickState.unverifiedRoleMode === 'create',
                unverified_role_name: quickState.unverifiedRoleName || 'Unverified',
                create_channel: quickState.channelMode === 'create',
                channel_name: quickState.channelName || 'verify',
                lock_channels: quickState.lockChannels,
                system: {
                  id: sysId,
                  name: quickState.embedTitle || 'Verification System',
                  enabled: true,
                  channel_id: quickState.channelMode === 'existing' ? quickState.channelId : '',
                  role_id: quickState.verifiedRoleMode === 'existing' ? quickState.verifiedRoleId : '',
                  remove_role_id: quickState.unverifiedRoleMode === 'existing' ? quickState.unverifiedRoleId : '',
                  verification_type: quickState.verificationType,
                  timeout_action: quickState.timeoutAction,
                  timeout_minutes: Number(quickState.timeoutMinutes) || 0,
                  questionnaire_enabled: Boolean(quickState.questionnaireEnabled || quickState.verificationType === 'questionnaire'),
                  questions: quickState.questions.filter(q => q.question && q.question.trim()),
                  embed_title: quickState.embedTitle || 'Verification Required',
                  embed_description: quickState.embedDescription || 'Click the button below to verify your account and gain access to the server.',
                  embed_color: quickState.embedColor || '#5865F2',
                  embed_image: '/img/default_verify.png',
                  button_label: quickState.buttonLabel || 'Verify',
                  button_style: quickState.buttonStyle || 'success'
                }
              });

              if (res?.created_verified_role && !roles.some(r => String(r.id) === String(res.created_verified_role.id))) {
                roles.push({ id: res.created_verified_role.id, name: res.created_verified_role.name, color: '#22c55e' });
              }
              if (res?.created_unverified_role && !roles.some(r => String(r.id) === String(res.created_unverified_role.id))) {
                roles.push({ id: res.created_unverified_role.id, name: res.created_unverified_role.name, color: '#737373' });
              }
              if (res?.created_channel && !textChannels.some(c => String(c.id) === String(res.created_channel.id))) {
                textChannels.push({ id: res.created_channel.id, name: res.created_channel.name, type: 0 });
              }
              if (Array.isArray(res?.systems)) {
                systems = res.systems;
              } else if (res?.system) {
                systems.push(res.system);
              }
              quickSetupOpen = false;
              if (window.Toast) Toast.success('Quick Setup completed successfully & panel sent!');
            } catch (err) {
              if (window.Toast) Toast.error('Quick Setup fehlgeschlagen: ' + (err.message || err));
            } finally {
              quickSubmitting = false;
              render();
            }
          };
        }
      }

      // Full System Editor Modal bindings
      if (editorOpen && editingSystem) {
        if (window.bindCustomSelects) {
          window.bindCustomSelects({
            'ed-channel-select': (v) => { editingSystem.channel_id = v; },
            'ed-vrole-select': (v) => { editingSystem.role_id = v; },
            'ed-urole-select': (v) => { editingSystem.remove_role_id = v; },
            'ed-timeout-action-select': (v) => {
              editingSystem.timeout_action = v;
              if (v !== 'none' && (!editingSystem.timeout_minutes || Number(editingSystem.timeout_minutes) <= 0)) {
                editingSystem.timeout_minutes = 10;
                const mIn = document.getElementById('ed-timeout-mins');
                if (mIn) mIn.value = '10';
              }
            },
            'ed-btn-style-select': (v) => {
              editingSystem.button_style = v;
              render();
            }
          });
        }

        const closeEditor = () => {
          if (!editorSubmitting) {
            editorOpen = false;
            editingSystem = null;
            render();
          }
        };
        const closeBtn = document.getElementById('sys-editor-close');
        const cancelBtn = document.getElementById('sys-editor-cancel');
        if (closeBtn) closeBtn.onclick = closeEditor;
        if (cancelBtn) cancelBtn.onclick = closeEditor;

        const nameIn = document.getElementById('ed-sys-name');
        if (nameIn) nameIn.oninput = (e) => { editingSystem.name = e.target.value; };

        container.querySelectorAll('[data-ed-vtype]').forEach(btn => {
          btn.onclick = () => {
            syncEditingSystemFromDom();
            const newVType = btn.getAttribute('data-ed-vtype');
            editingSystem.verification_type = newVType;
            if (newVType === 'questionnaire') {
              editingSystem.questionnaire_enabled = true;
              if (!Array.isArray(editingSystem.questions) || editingSystem.questions.length === 0) {
                editingSystem.questions = [{ question: 'Do you agree to follow our server rules?', placeholder: 'Type yes', answer: '' }];
              }
            }
            render();
          };
        });

        const tMinsIn = document.getElementById('ed-timeout-mins');
        if (tMinsIn) {
          tMinsIn.oninput = (e) => {
            editingSystem.timeout_minutes = Math.max(0, parseInt(e.target.value, 10) || 0);
          };
        }

        const addQBtn = document.getElementById('ed-add-question-btn');
        if (addQBtn) {
          addQBtn.onclick = () => {
            if (!Array.isArray(editingSystem.questions)) editingSystem.questions = [];
            if (editingSystem.questions.length >= 5) {
              if (window.Toast) Toast.error('Maximum of 5 questions per Discord modal.');
              return;
            }
            editingSystem.questions.push({ question: '', placeholder: 'Deine Antwort...', answer: '' });
            editingSystem.questionnaire_enabled = true;
            render();
          };
        }

        container.querySelectorAll('[data-ed-del-q]').forEach(btn => {
          btn.onclick = () => {
            const idx = Number(btn.getAttribute('data-ed-del-q'));
            editingSystem.questions.splice(idx, 1);
            render();
          };
        });

        container.querySelectorAll('[data-ed-q-text]').forEach(inp => {
          inp.oninput = (e) => {
            const idx = Number(inp.getAttribute('data-ed-q-text'));
            if (editingSystem.questions[idx]) editingSystem.questions[idx].question = e.target.value;
          };
        });

        container.querySelectorAll('[data-ed-q-ans]').forEach(inp => {
          inp.oninput = (e) => {
            const idx = Number(inp.getAttribute('data-ed-q-ans'));
            if (editingSystem.questions[idx]) editingSystem.questions[idx].answer = e.target.value;
          };
        });

        const titleIn = document.getElementById('ed-embed-title');
        if (titleIn) {
          titleIn.oninput = (e) => {
            editingSystem.embed_title = e.target.value;
            const prev = document.getElementById('ed-preview-title');
            if (prev) prev.textContent = e.target.value || 'Server Verification';
          };
        }

        const descIn = document.getElementById('ed-embed-desc');
        if (descIn) {
          descIn.oninput = (e) => {
            editingSystem.embed_description = e.target.value;
            const prev = document.getElementById('ed-preview-desc');
            if (prev) prev.textContent = e.target.value;
          };
        }

        const btnLblIn = document.getElementById('ed-btn-label');
        if (btnLblIn) {
          btnLblIn.oninput = (e) => {
            editingSystem.button_label = e.target.value;
            const prev = document.getElementById('ed-preview-btn');
            if (prev) prev.textContent = e.target.value || 'Verify';
          };
        }

        container.querySelectorAll('[data-ed-color]').forEach(sw => {
          sw.onclick = () => {
            editingSystem.embed_color = sw.getAttribute('data-ed-color');
            render();
          };
        });

        const colIn = document.getElementById('ed-embed-color');
        if (colIn) {
          colIn.oninput = (e) => {
            editingSystem.embed_color = e.target.value;
            const prev = document.getElementById('ed-preview-embed');
            if (prev) prev.style.borderLeftColor = e.target.value;
          };
        }

        const imgIn = document.getElementById('ed-embed-image');
        if (imgIn) {
          imgIn.oninput = (e) => {
            editingSystem.embed_image = e.target.value;
          };
        }

        const imgUpload = document.getElementById('ed-image-upload');
        if (imgUpload) {
          imgUpload.onchange = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              if (window.Toast) Toast.info('Lade Bild hoch...');
              const res = await API.uploadImage(file);
              if (res?.url) {
                editingSystem.embed_image = res.url;
                render();
                if (window.Toast) Toast.success('Banner-Bild hochgeladen!');
              }
            } catch (err) {
              if (window.Toast) Toast.error('Upload fehlgeschlagen: ' + (err.message || err));
            }
          };
        }

        // Save Only button
        const saveBtn = document.getElementById('sys-editor-save');
        if (saveBtn) {
          saveBtn.onclick = async () => {
            syncEditingSystemFromDom();
            editorSubmitting = true;
            render();
            try {
              const idx = systems.findIndex(s => String(s.id) === String(editingSystem.id));
              if (idx >= 0) {
                systems[idx] = JSON.parse(JSON.stringify(editingSystem));
              } else {
                systems.push(JSON.parse(JSON.stringify(editingSystem)));
              }
              await persistSystems(false);
              editorOpen = false;
              editingSystem = null;
            } finally {
              editorSubmitting = false;
              render();
            }
          };
        }

        // Save & Deploy button
        const deployBtn = document.getElementById('sys-editor-deploy');
        if (deployBtn) {
          deployBtn.onclick = async () => {
            syncEditingSystemFromDom();
            if (!editingSystem.channel_id) {
              if (window.Toast) Toast.error('Please select a channel to send the panel to.');
              return;
            }
            editorSubmitting = true;
            render();
            try {
              const res = await API.sendVerifyPanel(guildId, {
                system_id: editingSystem.id,
                channel_id: editingSystem.channel_id,
                system: editingSystem
              });
              if (Array.isArray(res?.systems)) {
                systems = res.systems;
              } else if (res?.system) {
                const idx = systems.findIndex(s => String(s.id) === String(editingSystem.id));
                if (idx >= 0) systems[idx] = res.system;
                else systems.push(res.system);
              }
              editorOpen = false;
              editingSystem = null;
              if (window.Toast) Toast.success('System gespeichert & Panel im Kanal bereitgestellt!');
            } catch (err) {
              if (window.Toast) Toast.error('Failed to deploy: ' + (err.message || err));
            } finally {
              editorSubmitting = false;
              render();
            }
          };
        }
      }
    }

    render();
  } catch (err) {
    container.innerHTML = `<div class="p-8 text-red-400 text-center">Failed to load verification: ${escapeHtml(err.message || err)}</div>`;
  }
};
