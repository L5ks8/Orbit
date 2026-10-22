/**
 * Orbit Dashboard - Embed Builder Studio
 * Real-time WYSIWYG Discord Embed Builder and Dispatcher.
 */

DashboardTabs.EmbedBuilder = async function(container, guildId) {
  container.innerHTML = `
    <div class="flex flex-col gap-6 max-w-6xl mx-auto animate-fade-in">
      <div id="embed-loading" class="flex items-center justify-center p-12 text-neutral-500 text-sm">
        <svg class="animate-spin mr-3 text-neutral-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        Loading Embed Builder Studio...
      </div>
      <div id="embed-content" class="hidden flex flex-col gap-6"></div>
    </div>
  `;

  try {
    const channels = await API.getChannels(guildId);
    const channelOptions = channels.map(c => ({ value: String(c.id), label: `# ${c.name}` }));

    let title = 'Announcement';
    let description = 'Type your announcement message here. Supports **bold**, *italic*, and `code` formatting.';
    let color = '#5865F2';
    let authorName = '';
    let footerText = '';
    let targetChannel = channelOptions[0]?.value || '';
    let fields = [];

    const content = document.getElementById('embed-content');
    const loading = document.getElementById('embed-loading');
    if (!content) return;

    const render = () => {
      content.innerHTML = `
        <div class="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h1 class="text-xl font-bold text-white">Embed Studio</h1>
            <p class="text-xs text-neutral-400 mt-1">Design and publish rich Discord embeds with live preview.</p>
          </div>
          <button type="button" id="send-embed-btn" class="px-6 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-white/10">
            ${icon('send', 14)} Send to Channel
          </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <!-- Editor Column -->
          <div class="flex flex-col gap-5 bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
            <!-- Channel Picker -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-neutral-300">Target Channel</label>
              ${renderCustomSelect({
                id: 'target-embed-channel',
                options: channelOptions,
                value: targetChannel,
                placeholder: 'Select channel...',
                onChange: (v) => { targetChannel = v; }
              })}
            </div>

            <!-- Color & Title -->
            <div class="flex items-center gap-3">
              <div>
                <label class="text-xs font-semibold text-neutral-300 block mb-1.5">Color</label>
                <input type="color" id="emb-color-picker" value="${color}" class="w-10 h-10 rounded-xl bg-transparent border border-neutral-700 cursor-pointer">
              </div>
              <div class="flex-1">
                <label class="text-xs font-semibold text-neutral-300 block mb-1.5">Title</label>
                <input type="text" id="emb-title-input" value="${title}" class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
              </div>
            </div>

            <!-- Description -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-neutral-300">Description</label>
              <textarea id="emb-desc-input" rows="4" class="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">${description}</textarea>
            </div>

            <!-- Author & Footer -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[11px] text-neutral-500 block mb-1">Author Name</label>
                <input type="text" id="emb-author-input" value="${authorName}" placeholder="e.g. Server Staff" class="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
              </div>
              <div>
                <label class="text-[11px] text-neutral-500 block mb-1">Footer Text</label>
                <input type="text" id="emb-footer-input" value="${footerText}" placeholder="e.g. Orbit Bot" class="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs focus:outline-none">
              </div>
            </div>

            <!-- Fields Editor -->
            <div class="flex flex-col gap-3 pt-3 border-t border-neutral-800">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white">Embed Fields (${fields.length})</span>
                <button type="button" id="add-emb-field-btn" class="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1">
                  ${icon('plus', 12)} Add Field
                </button>
              </div>

              <div class="flex flex-col gap-2" id="emb-fields-list">
                ${fields.map((f, idx) => `
                  <div class="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center gap-2" data-idx="${idx}">
                    <input type="text" class="field-name-inp flex-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs" value="${f.name}" placeholder="Field name">
                    <input type="text" class="field-val-inp flex-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs" value="${f.value}" placeholder="Field value">
                    <button type="button" class="del-field-btn p-1.5 text-neutral-500 hover:text-red-400" data-idx="${idx}">${icon('trash', 14)}</button>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Live Discord Preview Column -->
          <div class="flex flex-col gap-3 sticky top-6">
            <span class="text-xs font-bold text-neutral-400 uppercase tracking-wider">Discord Live Preview</span>
            <div class="p-5 rounded-2xl bg-[#313338] text-white font-sans shadow-2xl">
              <!-- Bot Header -->
              <div class="flex items-center gap-3 mb-3">
                <img src="/img/logo.png" class="w-10 h-10 rounded-full" alt="Orbit">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-white">Orbit</span>
                  <span class="px-1.5 py-0.5 rounded text-[10px] bg-[#5865F2] font-semibold text-white">BOT</span>
                  <span class="text-xs text-neutral-400">Today at 12:00 PM</span>
                </div>
              </div>

              <!-- Embed Card -->
              <div class="rounded-lg bg-[#2b2d31] border-l-4 p-4 flex flex-col gap-2" id="preview-card" style="border-left-color: ${color}">
                <div id="prev-author" class="text-xs font-semibold text-neutral-300 ${authorName ? '' : 'hidden'}">${authorName}</div>
                <div id="prev-title" class="text-base font-bold text-white ${title ? '' : 'hidden'}">${title}</div>
                <div id="prev-desc" class="text-xs text-neutral-300 leading-relaxed">${DiscordMarkdown.parse(description)}</div>
                
                <div id="prev-fields" class="grid grid-cols-2 gap-3 pt-2 ${fields.length > 0 ? '' : 'hidden'}">
                  ${fields.map(f => `
                    <div>
                      <div class="text-xs font-semibold text-white">${f.name}</div>
                      <div class="text-xs text-neutral-300">${f.value}</div>
                    </div>
                  `).join('')}
                </div>

                <div id="prev-footer" class="text-[11px] text-neutral-400 pt-2 border-t border-[#3b3e45] ${footerText ? '' : 'hidden'}">
                  ${footerText}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      // Live bindings
      const syncPreview = () => {
        title = document.getElementById('emb-title-input')?.value || '';
        description = document.getElementById('emb-desc-input')?.value || '';
        color = document.getElementById('emb-color-picker')?.value || '#5865F2';
        authorName = document.getElementById('emb-author-input')?.value || '';
        footerText = document.getElementById('emb-footer-input')?.value || '';

        const card = document.getElementById('preview-card');
        if (card) card.style.borderLeftColor = color;

        const pTitle = document.getElementById('prev-title');
        if (pTitle) {
          pTitle.textContent = title;
          pTitle.classList.toggle('hidden', !title);
        }

        const pDesc = document.getElementById('prev-desc');
        if (pDesc) pDesc.innerHTML = DiscordMarkdown.parse(description);

        const pAuth = document.getElementById('prev-author');
        if (pAuth) {
          pAuth.textContent = authorName;
          pAuth.classList.toggle('hidden', !authorName);
        }

        const pFoot = document.getElementById('prev-footer');
        if (pFoot) {
          pFoot.textContent = footerText;
          pFoot.classList.toggle('hidden', !footerText);
        }
      };

      document.getElementById('emb-title-input')?.addEventListener('input', syncPreview);
      document.getElementById('emb-desc-input')?.addEventListener('input', syncPreview);
      document.getElementById('emb-color-picker')?.addEventListener('input', syncPreview);
      document.getElementById('emb-author-input')?.addEventListener('input', syncPreview);
      document.getElementById('emb-footer-input')?.addEventListener('input', syncPreview);

      // Add field
      document.getElementById('add-emb-field-btn').onclick = () => {
        fields.push({ name: 'Field Title', value: 'Field description' });
        render();
      };

      // Delete field
      document.querySelectorAll('.del-field-btn').forEach(btn => {
        btn.onclick = (e) => {
          const idx = parseInt(btn.getAttribute('data-idx'));
          fields.splice(idx, 1);
          render();
        };
      });

      // Field inputs sync
      document.querySelectorAll('.field-name-inp').forEach((inp, idx) => {
        inp.oninput = () => {
          fields[idx].name = inp.value;
          syncPreview();
        };
      });
      document.querySelectorAll('.field-val-inp').forEach((inp, idx) => {
        inp.oninput = () => {
          fields[idx].value = inp.value;
          syncPreview();
        };
      });

      // Send Embed
      document.getElementById('send-embed-btn').onclick = async () => {
        if (!targetChannel) {
          Toast.error('Please select a target channel.');
          return;
        }
        const btn = document.getElementById('send-embed-btn');
        btn.textContent = 'Sending...';
        const toastId = Toast.loading('Sending embed to channel...');

        try {
          await API.sendCustomEmbed(guildId, {
            channel_id: targetChannel,
            title,
            description,
            color,
            author_name: authorName,
            footer_text: footerText,
            fields
          });
          Toast.update(toastId, 'Embed sent successfully!', 'success');
        } catch (err) {
          Toast.update(toastId, 'Failed to send embed: ' + err.message, 'error');
        } finally {
          btn.innerHTML = `${icon('send', 14)} Send to Channel`;
        }
      };
    };

    loading.classList.add('hidden');
    content.classList.remove('hidden');
    render();
  } catch (err) {
    container.innerHTML = `<div class="p-8 text-red-400 text-center">Error: ${err.message}</div>`;
  }
};
