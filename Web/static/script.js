let currentUser = null;
let currentGuildId = null;
let currentAutomodConfig = {};
let activeAutomodRule = null;
let autoresponder = {};
let joinroles = [];

const LOGS_CATEGORIES = [
    { id: "moderation_action", title: "Moderation Action", icon: '<i data-lucide="shield"></i>' },
    { id: "auto_moderation", title: "Auto Moderation", icon: '<i data-lucide="bot"></i>' },
    { id: "member_banned", title: "Member Banned", icon: '<i data-lucide="hammer"></i>' },
    { id: "member_unbanned", title: "Member Unbanned", icon: '<i data-lucide="check-circle"></i>' },
    { id: "member_kicked", title: "Member Kicked", icon: '<i data-lucide="user-minus"></i>' },
    { id: "message_deleted", title: "Message Deleted", icon: '<i data-lucide="trash-2"></i>' },
    { id: "message_edited", title: "Message Edited", icon: '<i data-lucide="edit-2"></i>' },
    { id: "bulk_message_delete", title: "Bulk Message Delete", icon: '<i data-lucide="trash"></i>' },
    { id: "member_joined", title: "Member Joined", icon: '<i data-lucide="user-plus"></i>' },
    { id: "member_left", title: "Member Left", icon: '<i data-lucide="user-minus"></i>' },
    { id: "member_joined_voice", title: "Joined Voice Channel", icon: '<i data-lucide="mic"></i>' },
    { id: "member_left_voice", title: "Left Voice Channel", icon: '<i data-lucide="mic-off"></i>' },
    { id: "member_moved_voice", title: "Moved Voice Channel", icon: '<i data-lucide="headphones"></i>' },
    { id: "voice_mute", title: "Voice Muted", icon: '<i data-lucide="volume-x"></i>' },
    { id: "voice_unmute", title: "Voice Unmuted", icon: '<i data-lucide="volume-2"></i>' },
    { id: "voice_deafen", title: "Server Deafened", icon: '<i data-lucide="ear-off"></i>' },
    { id: "voice_undeafen", title: "Server Undeafened", icon: '<i data-lucide="ear"></i>' },
    { id: "role_created", title: "Role Created", icon: '<i data-lucide="plus-circle"></i>' },
    { id: "role_deleted", title: "Role Deleted", icon: '<i data-lucide="minus-circle"></i>' },
    { id: "role_updated", title: "Role Updated", icon: '<i data-lucide="settings"></i>' },
    { id: "channel_created", title: "Channel Created", icon: '<i data-lucide="folder-plus"></i>' },
    { id: "channel_deleted", title: "Channel Deleted", icon: '<i data-lucide="folder-minus"></i>' },
    { id: "channel_updated", title: "Channel Updated", icon: '<i data-lucide="refresh-cw"></i>' },
    { id: "scheduled_event_created", title: "Event Created", icon: '<i data-lucide="calendar-plus"></i>' },
    { id: "scheduled_event_deleted", title: "Event Deleted", icon: '<i data-lucide="calendar-minus"></i>' },
    { id: "scheduled_event_updated", title: "Event Updated", icon: '<i data-lucide="calendar"></i>' },
    { id: "mod_command_used", title: "Mod Command Used", icon: '<i data-lucide="terminal"></i>' }
];

// Views
const views = {
    landing: document.getElementById('view-landing'),
    dashboard: document.getElementById('view-dashboard'),
    config: document.getElementById('view-config')
};

function showView(viewName) {
    Object.values(views).forEach(v => v.classList.add('hidden'));
    views[viewName].classList.remove('hidden');

    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
        if (viewName === 'config') {
            mainContainer.style.display = 'none';
            document.body.style.overflow = 'hidden';
        } else {
            mainContainer.style.display = '';
            document.body.style.overflow = '';
        }
    }
}

// Initial Load
async function init() {
    try {
        const [userRes, statsRes] = await Promise.all([
            fetch('/api/user'),
            fetch('/api/stats')
        ]);

        if (statsRes.ok) {
            const stats = await statsRes.json();
            document.getElementById('stat-servers').innerText = stats.servers || '--';
            document.getElementById('stat-users').innerText = stats.users || '--';
            document.getElementById('stat-ping').innerText = stats.ping || '--';
        }

        if (userRes.ok) {
            currentUser = await userRes.json();
            document.getElementById('nav-user').innerHTML = `
                <div class="avatar"><img src="https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png" alt="Avatar" style="width:100%;height:100%;border-radius:50%"></div>
                <span style="font-weight:600">${currentUser.username}</span>
                <a href="/auth/logout" class="btn-secondary" style="padding: 6px 12px; margin-left: 10px;">Logout</a>
            `;
            const heroBtn = document.getElementById('btn-hero-login');
            if (heroBtn) { heroBtn.innerHTML = 'Go to Dashboard <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'; heroBtn.onclick = loadDashboard; }
        } else {
            const heroBtn = document.getElementById('btn-hero-login');
            if (heroBtn) heroBtn.onclick = () => window.location.href = '/auth/login';
            const loginBtn = document.getElementById('btn-login');
            if (loginBtn) loginBtn.onclick = () => window.location.href = '/auth/login';
        }
        // Footer login button
        const footerLogin = document.getElementById('btn-footer-login');
        if (footerLogin) footerLogin.onclick = currentUser ? loadDashboard : () => window.location.href = '/auth/login';
    } catch (e) {
        console.error(e);
        showView('landing');
    }

    lucide.createIcons();
}

function initChipPicker(pickerId, tagsContainerId, hiddenInputId, initialValues, prefix) {
    const picker = document.getElementById(pickerId);
    const container = document.getElementById(tagsContainerId);
    const hiddenInput = document.getElementById(hiddenInputId);
    
    if (!picker || !container || !hiddenInput) return;
    
    let selectedIds = Array.isArray(initialValues) ? [...initialValues] : [];
    
    function renderChips() {
        container.innerHTML = '';
        selectedIds.forEach(id => {
            const option = Array.from(picker.options).find(o => o.value === id);
            if (!option) return;
            const chip = document.createElement('div');
            chip.className = 'chip';
            chip.innerHTML = `${option.textContent} <span class="chip-remove" data-id="${id}">&times;</span>`;
            container.appendChild(chip);
        });
        
        container.querySelectorAll('.chip-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const removeId = e.target.getAttribute('data-id');
                selectedIds = selectedIds.filter(i => i !== removeId);
                renderChips();
            });
        });
        
        hiddenInput.value = selectedIds.join(',');
    }
    
    picker.addEventListener('change', () => {
        const val = picker.value;
        if (val && !selectedIds.includes(val)) {
            selectedIds.push(val);
            renderChips();
        }
        picker.value = '';
    });
    
    // Defer initial render slightly to ensure options are loaded
    setTimeout(renderChips, 100);
}

async function openSupportInvite() {
    const btn = document.getElementById('btn-support-invite');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
    try {
        const res = await fetch('/api/support-invite');
        const data = await res.json();
        if (data.url) {
            window.open(data.url, '_blank', 'noopener');
        } else {
            showToast('Could not generate invite link.');
        }
    } catch (e) {
        showToast('Failed to connect to support server.');
    } finally {
        if (btn) { btn.disabled = false; btn.style.opacity = ''; }
    }
}

async function loadDashboard() {
    if (!currentUser) {
        window.location.href = '/auth/login';
        return;
    }
    showView('dashboard');
    const grid = document.getElementById('server-grid');
    const loader = document.getElementById('dashboard-loader');
    grid.innerHTML = '';
    loader.classList.remove('hidden');

    try {
        const res = await fetch('/api/guilds');
        const guilds = await res.json();

        loader.classList.add('hidden');

        if (guilds.length === 0) {
            grid.innerHTML = `<p style="color:var(--text-secondary);grid-column:1/-1;text-align:center;">You don't have admin permissions on any servers with Orbit.</p>`;
            return;
        }

        guilds.forEach(g => {
            const card = document.createElement('a');
            card.href = '#';
            card.className = 'server-card';
            card.onclick = (e) => {
                e.preventDefault();
                loadConfig(g.id, g.name, g.icon);
            };

            const iconUrl = g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : '';
            const iconHtml = iconUrl ? `<img src="${iconUrl}">` : g.name.charAt(0);

            card.innerHTML = `
                <div class="server-icon">${iconHtml}</div>
                <div class="server-info">
                    <h3>${g.name}</h3>
                    <p>Configurable</p>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (e) {
        loader.classList.add('hidden');
        grid.innerHTML = `<p style="color:red;">Error loading servers.</p>`;
    }
}

class CustomSelect {
    constructor(selectElement, items, selectedValue, placeholder, isRole = false) {
        this.select = selectElement;
        this.select.style.display = 'none';

        if (this.select.nextElementSibling && this.select.nextElementSibling.classList.contains('custom-select')) {
            this.select.nextElementSibling.remove();
        }

        this.items = items;
        this.value = selectedValue || '';
        this.placeholder = placeholder || 'Select...';
        this.isRole = isRole;
        this.select.value = this.value;

        this.container = document.createElement('div');
        this.container.className = 'custom-select';

        this.trigger = document.createElement('div');
        this.trigger.className = 'custom-select-trigger';

        this.dropdown = document.createElement('div');
        this.dropdown.className = 'custom-select-dropdown';

        this.searchContainer = document.createElement('div');
        this.searchContainer.className = 'custom-select-search';
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.placeholder = 'Search...';
        this.searchContainer.appendChild(this.searchInput);

        this.optionsContainer = document.createElement('div');
        this.optionsContainer.className = 'custom-select-options';

        this.dropdown.appendChild(this.searchContainer);
        this.dropdown.appendChild(this.optionsContainer);

        this.container.appendChild(this.trigger);
        this.container.appendChild(this.dropdown);

        this.select.parentNode.insertBefore(this.container, this.select.nextSibling);

        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = this.container.classList.contains('open');
            document.querySelectorAll('.custom-select').forEach(el => el.classList.remove('open'));
            if (!isOpen) {
                this.container.classList.add('open');
                this.searchInput.value = '';
                this.renderOptions('');
                this.searchInput.focus();
            }
        });

        this.searchInput.addEventListener('input', (e) => {
            e.stopPropagation();
            this.renderOptions(e.target.value.toLowerCase());
        });

        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.container.classList.remove('open');
            }
        });

        this.updateTrigger(placeholder);
    }

    updateTrigger(placeholder) {
        const item = this.items.find(i => String(i.id) === String(this.value));
        if (item) {
            const prefix = this.isRole ? '@' : '#';
            const colorHtml = this.isRole ? `<span class="color-dot" style="background:${item.color}"></span> ` : '';
            this.trigger.innerHTML = `<div class="content" style="display:flex;align-items:center;gap:4px;"><div class="cm-tag" style="margin:0;">${colorHtml}${prefix}${item.name}</div></div> <i data-lucide="chevron-down" style="width: 14px; height: 14px; flex-shrink: 0;"></i>`;
        } else {
            this.trigger.innerHTML = `<div class="content" style="color:var(--text-secondary); font-weight:600;">${placeholder}</div> <i data-lucide="chevron-down" style="width: 14px; height: 14px; flex-shrink: 0;"></i>`;
        }
        lucide.createIcons({ root: this.trigger });
        this.select.value = this.value;
    }

    renderOptions(filter) {
        this.optionsContainer.innerHTML = '';

        const noneOption = document.createElement('div');
        noneOption.className = `custom-select-option ${this.value === '' ? 'selected' : ''}`;
        noneOption.innerHTML = `<div class="content" style="color:var(--text-secondary)">None</div>`;
        noneOption.addEventListener('click', () => {
            this.value = '';
            this.updateTrigger('None');
            this.container.classList.remove('open');
        });
        this.optionsContainer.appendChild(noneOption);

        this.items.filter(i => i.name.toLowerCase().includes(filter)).forEach(item => {
            const opt = document.createElement('div');
            opt.className = `custom-select-option ${String(this.value) === String(item.id) ? 'selected' : ''}`;
            const prefix = this.isRole ? '@' : '#';
            const colorHtml = this.isRole ? `<span class="color-dot" style="background:${item.color}"></span> ` : '';
            opt.innerHTML = `${colorHtml}${prefix}${item.name}`;
            opt.addEventListener('click', () => {
                this.value = item.id;
                this.updateTrigger(this.placeholder);
                this.container.classList.remove('open');
            });
            this.optionsContainer.appendChild(opt);
        });
    }
}

class CustomMultiSelect {
    constructor(selectElement, items, placeholder, renderTag) {
        this.select = selectElement;
        this.select.style.display = 'none';

        if (this.select.nextElementSibling && this.select.nextElementSibling.classList.contains('custom-multiselect')) {
            this.select.nextElementSibling.remove();
        }

        this.items = items;
        this.placeholder = placeholder || 'Select...';
        this.renderTag = renderTag || ((item) => item.name);

        this.container = document.createElement('div');
        this.container.className = 'custom-multiselect';

        this.trigger = document.createElement('div');
        this.trigger.className = 'custom-multiselect-trigger';

        this.tagsContainer = document.createElement('div');
        this.tagsContainer.className = 'custom-multiselect-tags';

        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.placeholder = this.placeholder;
        this.searchInput.className = 'custom-multiselect-input';

        this.trigger.appendChild(this.tagsContainer);
        this.trigger.appendChild(this.searchInput);

        this.dropdown = document.createElement('div');
        this.dropdown.className = 'custom-select-dropdown';

        this.optionsContainer = document.createElement('div');
        this.optionsContainer.className = 'custom-select-options';
        this.dropdown.appendChild(this.optionsContainer);

        this.container.appendChild(this.trigger);
        this.container.appendChild(this.dropdown);
        this.select.parentNode.insertBefore(this.container, this.select.nextSibling);

        this.renderTags();
        this.renderOptions('');

        this.container.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target.closest('.cm-tag-remove')) return;
            const isOpen = this.container.classList.contains('open');
            document.querySelectorAll('.custom-multiselect').forEach(el => el.classList.remove('open'));
            document.querySelectorAll('.custom-select').forEach(el => el.classList.remove('open'));
            if (!isOpen) {
                this.container.classList.add('open');
                this.searchInput.focus();
            }
        });

        this.searchInput.addEventListener('input', (e) => {
            this.renderOptions(e.target.value.toLowerCase());
        });

        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.container.classList.remove('open');
                this.searchInput.value = '';
                this.renderOptions('');
            }
        });
    }

    renderTags() {
        this.tagsContainer.innerHTML = '';
        const selectedValues = Array.from(this.select.selectedOptions).map(o => o.value);

        if (selectedValues.length > 0) {
            this.searchInput.placeholder = '';
        } else {
            this.searchInput.placeholder = this.placeholder;
        }

        selectedValues.forEach(val => {
            const item = this.items.find(i => String(i.id) === String(val));
            if (!item) return;

            const tag = document.createElement('div');
            tag.className = 'cm-tag';
            tag.innerHTML = this.renderTag(item) + ' <span class="cm-tag-remove" data-id="' + item.id + '"><i data-lucide="x" style="width: 14px; height: 14px;"></i></span>';
            this.tagsContainer.appendChild(tag);

            tag.querySelector('.cm-tag-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleOption(item.id, false);
            });
        });
        lucide.createIcons({ root: this.tagsContainer });
    }

    renderOptions(filter) {
        this.optionsContainer.innerHTML = '';
        const selectedValues = Array.from(this.select.selectedOptions).map(o => o.value);

        let count = 0;
        this.items.forEach(item => {
            if (selectedValues.includes(item.id)) return;
            if (filter && !item.name.toLowerCase().includes(filter)) return;

            const optEl = document.createElement('div');
            optEl.className = 'custom-select-option';
            optEl.innerHTML = this.renderTag(item);

            optEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleOption(item.id, true);
                this.searchInput.value = '';
                this.renderOptions('');
                this.searchInput.focus();
            });
            this.optionsContainer.appendChild(optEl);
            count++;
        });

        if (count === 0) {
            this.optionsContainer.innerHTML = '<div class="custom-select-option" style="color:var(--text-muted); cursor:default;">No results</div>';
        }
    }

    toggleOption(id, selectIt) {
        const option = Array.from(this.select.options).find(o => String(o.value) === String(id));
        if (option) {
            option.selected = selectIt;
            this.renderTags();
            this.renderOptions(this.searchInput.value.toLowerCase());
            this.select.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}

let globalRoles = [];
let globalCategories = [];
let globalChannels = [];
let currentPermissions = {};

function lockSection(sectionId, requirementText) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    section.style.position = 'relative';
    section.style.opacity = '0.6';
    section.style.pointerEvents = 'none';
    section.style.filter = 'grayscale(80%)';

    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.4)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '10';
    overlay.style.borderRadius = '8px';

    const icon = document.createElement('div');
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
    icon.style.color = '#fff';
    icon.style.marginBottom = '10px';

    const text = document.createElement('div');
    text.innerText = `Missing Permissions: ${requirementText}`;
    text.style.color = '#fff';
    text.style.fontWeight = 'bold';
    text.style.background = 'rgba(0,0,0,0.8)';
    text.style.padding = '8px 16px';
    text.style.borderRadius = '4px';

    overlay.appendChild(icon);
    overlay.appendChild(text);
    section.appendChild(overlay);

    const inputs = section.querySelectorAll('input, select, button');
    inputs.forEach(i => i.disabled = true);
}

function renderAutoReplies(replies) {
    const list = document.getElementById('autoreply-list');
    list.innerHTML = '';
    if (Object.keys(replies).length === 0) {
        list.innerHTML = '<p style="color:var(--text-secondary); font-size:14px; margin:0;">No auto-replies configured.</p>';
        return;
    }

    for (const [trigger, data] of Object.entries(replies)) {
        addAutoReplyRow(trigger, data.response, data.channel_id || '');
    }
}

function addAutoReplyRow(triggerText = '', responseText = '', channelId = '') {
    const list = document.getElementById('autoreply-list');
    if (list.querySelector('p')) list.innerHTML = ''; // Clear empty message

    const row = document.createElement('div');
    row.className = 'autoreply-row';
    row.style.cssText = 'display: flex; flex-direction: column; gap: 8px; background: var(--bg-color); padding: 10px; border-radius: 6px; border: 1px solid var(--border-color);';

    // Top row: trigger + response + delete
    const topRow = document.createElement('div');
    topRow.style.cssText = 'display: flex; gap: 10px; align-items: center;';
    topRow.innerHTML = `
        <input type="text" class="ar-trigger" value="${triggerText.replace(/"/g, '&quot;')}" placeholder="Trigger (e.g. !help)" style="flex: 1; min-width: 0; background: #000000; border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px; border-radius: 4px; outline: none;">
        <input type="text" class="ar-response" value="${responseText.replace(/"/g, '&quot;')}" placeholder="Bot Response (use #channel-name for mentions)" style="flex: 2; min-width: 0; background: #000000; border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px; border-radius: 4px; outline: none;">
        <button type="button" class="btn-danger" style="width: 38px; height: 38px; padding: 0; flex-shrink: 0; display: flex; align-items: center; justify-content: center;" onclick="this.closest('.autoreply-row').remove()">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
        </button>
    `;

    // Bottom row: channel select
    const botRow = document.createElement('div');
    botRow.style.cssText = 'display: flex; align-items: center; gap: 8px;';
    let channelOptionsHTML = '<option value="">All Channels</option>';
    globalChannels.forEach(c => {
        const sel = String(channelId) === String(c.id) ? 'selected' : '';
        channelOptionsHTML += `<option value="${c.id}" ${sel}>#${c.name}</option>`;
    });
    botRow.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-secondary); flex-shrink:0;"><path d="M4 9h16M4 15h16"/><path d="M10 3 8 21M16 3l-2 18"/></svg>
        <select class="ar-channel" style="background: #000000; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 4px 8px; border-radius: 4px; font-size: 13px; outline: none; flex:1; max-width: 260px;">
            ${channelOptionsHTML}
        </select>
    `;

    row.appendChild(topRow);
    row.appendChild(botRow);
    list.appendChild(row);
}

document.getElementById('btn-add-autoreply').addEventListener('click', () => addAutoReplyRow());

function renderTicketOptions(optionsSlots) {
    const list = document.getElementById('ticket-option-list');
    list.innerHTML = '';
    if (!optionsSlots || optionsSlots.length === 0) {
        list.innerHTML = '<p style="color:var(--text-secondary); font-size:14px; margin:0;">No ticket options configured.</p>';
        return;
    }

    optionsSlots.forEach(slot => addTicketOptionRow(slot));
}

function addTicketOptionRow(slot = { name: '', role_id: '', category_id: '' }) {
    const list = document.getElementById('ticket-option-list');
    if (list.querySelector('p')) list.innerHTML = '';

    const row = document.createElement('div');
    row.className = 'ticket-option-row';
    row.style.cssText = 'display: flex; gap: 10px; align-items: flex-end; background: var(--bg-color); padding: 12px; border-radius: 6px; border: 1px solid var(--border-color); flex-wrap: wrap;';

    // Name input
    const nameGroup = document.createElement('div');
    nameGroup.style.cssText = 'flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 4px;';
    nameGroup.innerHTML = `
        <label style="font-size: 12px; color: var(--text-secondary);">Option Name</label>
        <input type="text" class="to-name" value="${(slot.name || '').replace(/"/g, '&quot;')}" placeholder="e.g. Bug Report" style="background: #000000; border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px; border-radius: 4px; outline: none; height: 38px; box-sizing: border-box;">
    `;

    // Role Select (Custom)
    const roleGroup = document.createElement('div');
    roleGroup.style.cssText = 'flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 4px;';
    const roleLabel = document.createElement('label');
    roleLabel.style.cssText = 'font-size: 12px; color: var(--text-secondary);';
    roleLabel.innerText = 'Support Role';

    const roleSelectContainer = document.createElement('div');
    const roleHiddenInput = document.createElement('input');
    roleHiddenInput.type = 'hidden';
    roleHiddenInput.className = 'to-role';
    roleSelectContainer.appendChild(roleHiddenInput);

    roleGroup.appendChild(roleLabel);
    roleGroup.appendChild(roleSelectContainer);

    // Category Select (Native)
    const catGroup = document.createElement('div');
    catGroup.style.cssText = 'flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 4px;';
    let catOptionsHTML = '<option value="">Select Category...</option>';
    globalCategories.forEach(c => {
        const selected = (String(slot.category_id) === String(c.id)) ? 'selected' : '';
        catOptionsHTML += `<option value="${c.id}" ${selected}>${c.name}</option>`;
    });

    catGroup.innerHTML = `
        <label style="font-size: 12px; color: var(--text-secondary);">Ticket Category</label>
        <select class="to-category" style="background: #000000; border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px; border-radius: 4px; outline: none; height: 38px; box-sizing: border-box;">
            ${catOptionsHTML}
        </select>
    `;

    // Remove Button
    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.className = 'btn-danger';
    btnRemove.style.cssText = 'padding: 0 12px; font-size: 16px; height: 38px;';
    btnRemove.innerHTML = '<i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>';
    btnRemove.onclick = () => row.remove();
    lucide.createIcons({ root: btnRemove });

    row.appendChild(nameGroup);
    row.appendChild(roleGroup);
    row.appendChild(catGroup);
    row.appendChild(btnRemove);
    list.appendChild(row);

    // Initialize CustomSelect for the support role
    new CustomSelect(roleHiddenInput, globalRoles, slot.role_id || '', 'Select Staff Role...');
}

document.getElementById('btn-add-ticket-option').addEventListener('click', () => {
    addTicketOptionRow();
});

// FILE CHANNELS
function renderFileChannels(channels) {
    const list = document.getElementById('file-channels-body');
    list.innerHTML = '';
    if (!channels || channels.length === 0) {
        list.innerHTML = '<tr id="empty-file-channels"><td colspan="4" style="text-align: center; padding: 20px; font-size: 13px; color: var(--text-muted);">No File-Channels found.</td></tr>';
        return;
    }
    channels.forEach(ch => addFileChannelRow(ch));
}

function addFileChannelRow(data = { channel_id: '', extensions: '', ignore_bots: true }) {
    const list = document.getElementById('file-channels-body');
    const emptyRow = document.getElementById('empty-file-channels');
    if (emptyRow) emptyRow.remove();

    const tr = document.createElement('tr');
    tr.className = 'fc-row';
    tr.style.borderBottom = '1px solid var(--border-color)';

    // Channel
    const tdChannel = document.createElement('td');
    tdChannel.style.padding = '10px';
    const chSelect = document.createElement('select');
    chSelect.className = 'fc-channel';
    chSelect.style.cssText = 'width: 100%; background: #000000; border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px; border-radius: 4px; outline: none; height: 38px; box-sizing: border-box;';
    chSelect.innerHTML = '<option value="">Select Channel...</option>';
    globalChannels.forEach(c => {
        const selected = (String(data.channel_id) === String(c.id)) ? 'selected' : '';
        chSelect.innerHTML += `<option value="${c.id}" ${selected}>#${c.name}</option>`;
    });
    tdChannel.appendChild(chSelect);

    // Extensions
    const tdExt = document.createElement('td');
    tdExt.style.padding = '10px';
    tdExt.innerHTML = `<input type="text" class="fc-extensions" value="${(data.extensions || '').replace(/"/g, '&quot;')}" placeholder="e.g. pdf, png" style="width: 100%; background: #000000; border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px; border-radius: 4px; outline: none; height: 38px; box-sizing: border-box;">`;

    // Ignore Bots
    const tdBots = document.createElement('td');
    tdBots.style.padding = '10px';
    const checked = data.ignore_bots !== false ? 'checked' : '';
    tdBots.innerHTML = `<label class="switch"><input type="checkbox" class="fc-ignore" ${checked}><span class="slider"></span></label>`;

    // Action
    const tdAction = document.createElement('td');
    tdAction.style.padding = '10px';
    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.className = 'btn-danger';
    btnRemove.style.cssText = 'padding: 0 12px; font-size: 16px; height: 38px;';
    btnRemove.innerHTML = '<i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>';
    btnRemove.onclick = () => {
        tr.remove();
        if (list.children.length === 0) {
            list.innerHTML = '<tr id="empty-file-channels"><td colspan="4" style="text-align: center; padding: 20px; font-size: 13px; color: var(--text-muted);">No File-Channels found.</td></tr>';
        }
    };
    lucide.createIcons({ root: btnRemove });
    tdAction.appendChild(btnRemove);

    tr.appendChild(tdChannel);
    tr.appendChild(tdExt);
    tr.appendChild(tdBots);
    tr.appendChild(tdAction);
    list.appendChild(tr);
}

document.getElementById('btn-add-file-channel').addEventListener('click', () => {
    addFileChannelRow();
});

// AUTO REACTIONS
function renderAutoReactions(channels) {
    const list = document.getElementById('auto-reaction-body');
    list.innerHTML = '';
    if (!channels || channels.length === 0) {
        list.innerHTML = '<tr id="empty-auto-reaction"><td colspan="4" style="text-align: center; padding: 20px; font-size: 13px; color: var(--text-muted);">No Reaction-Channels found.</td></tr>';
        return;
    }
    channels.forEach(ch => addAutoReactionRow(ch));
}

function addAutoReactionRow(data = { channel_id: '', emoji: '', ignore_bots: true }) {
    const list = document.getElementById('auto-reaction-body');
    const emptyRow = document.getElementById('empty-auto-reaction');
    if (emptyRow) emptyRow.remove();

    const tr = document.createElement('tr');
    tr.className = 'ar-row';
    tr.style.borderBottom = '1px solid var(--border-color)';

    // Channel
    const tdChannel = document.createElement('td');
    tdChannel.style.padding = '10px';
    const chSelect = document.createElement('select');
    chSelect.className = 'ar-channel-sel';
    chSelect.style.cssText = 'width: 100%; background: #000000; border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px; border-radius: 4px; outline: none; height: 38px; box-sizing: border-box;';
    chSelect.innerHTML = '<option value="">Select Channel...</option>';
    globalChannels.forEach(c => {
        const selected = (String(data.channel_id) === String(c.id)) ? 'selected' : '';
        chSelect.innerHTML += `<option value="${c.id}" ${selected}>#${c.name}</option>`;
    });
    tdChannel.appendChild(chSelect);

    // Emoji
    const tdEmoji = document.createElement('td');
    tdEmoji.style.padding = '10px';
    tdEmoji.innerHTML = `<input type="text" class="ar-emoji" value="${(data.emoji || '').replace(/"/g, '&quot;')}" placeholder="e.g. 👍 or <:name:id>" style="width: 100%; background: #000000; border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px; border-radius: 4px; outline: none; height: 38px; box-sizing: border-box;">`;

    // Ignore Bots
    const tdBots = document.createElement('td');
    tdBots.style.padding = '10px';
    const checked = data.ignore_bots !== false ? 'checked' : '';
    tdBots.innerHTML = `<label class="switch"><input type="checkbox" class="ar-ignore" ${checked}><span class="slider"></span></label>`;

    // Action
    const tdAction = document.createElement('td');
    tdAction.style.padding = '10px';
    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.className = 'btn-danger';
    btnRemove.style.cssText = 'padding: 0 12px; font-size: 16px; height: 38px;';
    btnRemove.innerHTML = '<i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>';
    btnRemove.onclick = () => {
        tr.remove();
        if (list.children.length === 0) {
            list.innerHTML = '<tr id="empty-auto-reaction"><td colspan="4" style="text-align: center; padding: 20px; font-size: 13px; color: var(--text-muted);">No Reaction-Channels found.</td></tr>';
        }
    };
    lucide.createIcons({ root: btnRemove });
    tdAction.appendChild(btnRemove);

    tr.appendChild(tdChannel);
    tr.appendChild(tdEmoji);
    tr.appendChild(tdBots);
    tr.appendChild(tdAction);
    list.appendChild(tr);
}

document.getElementById('btn-add-auto-reaction').addEventListener('click', () => {
    addAutoReactionRow();
});

// LOAD CONFIGURATION
let currentGuildName = '';
let currentGuildIcon = '';

async function loadConfig(guildId, guildName, guildIcon, keepTab = false) {
    currentGuildId = guildId;
    if (guildName !== undefined) currentGuildName = guildName;
    if (guildIcon !== undefined) currentGuildIcon = guildIcon;
    
    document.getElementById('config-server-name').innerText = currentGuildName;
    const iconUrl = currentGuildIcon ? `https://cdn.discordapp.com/icons/${guildId}/${currentGuildIcon}.png` : '';
    document.getElementById('sidebar-server-icon').innerHTML = iconUrl ? `<img src="${iconUrl}">` : (currentGuildName?.charAt(0) || '');
    showView('config');

    document.getElementById('config-layout').style.display = 'none';
    document.getElementById('config-loader').classList.remove('hidden');

    if (!keepTab) {
        // Reset tabs to overview section
        document.querySelectorAll('.dash-nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
        document.querySelector('.dash-nav-item[data-target="section-overview"]')?.classList.add('active');
        document.getElementById('section-overview')?.classList.add('active');
    }

    try {
        const res = await fetch(`/api/config/${guildId}`);
        const data = await res.json();
        globalRoles = data.roles;
        globalCategories = data.categories || [];
        globalChannels = data.channels || [];
        globalVoiceChannels = data.voice_channels || [];
        
        // Load messages for the embed builder UI
        loadMessages();

        // Initialize Charts
        if (window.Chart) {
            setTimeout(() => {
                initCharts();
                if (typeof fetchAndRenderStats === 'function') {
                    fetchAndRenderStats(document.getElementById('chart_days_select')?.value || 7);
                }
            }, 500);
        }

        // --- WELCOME ---
        const welcomeSelect = document.getElementById('welcome_channel_id');
        welcomeSelect.innerHTML = '<option value="">None</option>';
        const goodbyeSelect = document.getElementById('goodbye_channel_id');
        goodbyeSelect.innerHTML = '<option value="">None</option>';
        const boostSelect = document.getElementById('boost_channel_id');
        boostSelect.innerHTML = '<option value="">None</option>';
        const verifyPanelSelect = document.getElementById('verify_panel_channel');
        verifyPanelSelect.innerHTML = '<option value="">Select Channel...</option>';
        const ticketPanelSelect = document.getElementById('ticket_panel_channel');
        ticketPanelSelect.innerHTML = '<option value="">Select Channel...</option>';
        const ticketLogSelect = document.getElementById('ticket_log_channel_id');
        ticketLogSelect.innerHTML = '<option value="">None</option>';
        data.channels.forEach(c => {
            const opt = `<option value="${c.id}">#${c.name}</option>`;
            welcomeSelect.innerHTML += opt;
            goodbyeSelect.innerHTML += opt;
            boostSelect.innerHTML += opt;
            verifyPanelSelect.innerHTML += `<option value="${c.id}">#${c.name}</option>`;
            ticketPanelSelect.innerHTML += `<option value="${c.id}">#${c.name}</option>`;
            ticketLogSelect.innerHTML += `<option value="${c.id}">#${c.name}</option>`;
        });

        const embedSelect = document.getElementById('embed_channel_id');
        if (embedSelect) {
            embedSelect.innerHTML = '<option value="">Select Channel...</option>';
            data.channels.forEach(c => {
                embedSelect.innerHTML += `<option value="${c.id}">#${c.name}</option>`;
            });
        }


        // Set values
        const config = data.config;
        currentPermissions = data.permissions || {};

        // Settings: Manager Roles
        const settingsManagerRolesEl = document.getElementById('settings_manager_roles');
        if (settingsManagerRolesEl) {
            settingsManagerRolesEl.innerHTML = "";
            globalRoles.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r.id;
                opt.textContent = r.name;
                if (config.settings?.manager_roles?.includes(r.id)) opt.selected = true;
                settingsManagerRolesEl.appendChild(opt);
            });
            new CustomMultiSelect(settingsManagerRolesEl, globalRoles, "Select...", (item) => `<span class="role-badge" style="border-color: ${item.color !== '#000000' ? item.color : '#4E5058'}"><span class="role-dot" style="background-color: ${item.color !== '#000000' ? item.color : '#949BA4'}"></span>${item.name}</span>`);
        }

        if (config.settings) {
            document.getElementById('settings_timezone').value = config.settings.timezone || 'UTC';
            document.getElementById('settings_embed_style').value = config.settings.embed_style || 'normal';
        }

        // Welcome
        if (!currentPermissions.can_channels) lockSection('section-welcome', 'Manage Channels');
        document.getElementById('welcome_enabled').checked = config.welcome?.enabled || false;
        document.getElementById('welcome_channel_id').value = config.welcome?.channel_id || '';
        document.getElementById('welcome_message').value = config.welcome?.message || 'Welcome {user} to {server}!';
        const imgUrl = config.welcome?.image_url || '';
        document.getElementById('welcome_image_url').value = imgUrl;
        syncDropzoneFromUrl(imgUrl);

        // Goodbye
        if (!currentPermissions.can_channels) lockSection('section-goodbye', 'Manage Channels');
        document.getElementById('goodbye_enabled').checked = config.goodbye?.enabled || false;
        document.getElementById('goodbye_channel_id').value = config.goodbye?.channel_id || '';
        document.getElementById('goodbye_message').value = config.goodbye?.message || "We're sad to see you go, {user}!";
        const gbImgUrl = config.goodbye?.image_url || '';
        document.getElementById('goodbye_image_url').value = gbImgUrl;
        syncGoodbyeDropzoneFromUrl(gbImgUrl);

        // Boost
        if (!currentPermissions.can_channels) lockSection('section-boost', 'Manage Channels');
        document.getElementById('boost_enabled').checked = config.boost?.enabled || false;
        document.getElementById('boost_channel_id').value = config.boost?.channel_id || '';
        document.getElementById('boost_message').value = config.boost?.message || 'Thank you for boosting the server, {user}!';
        const boostImgUrl = config.boost?.image_url || '';
        document.getElementById('boost_image_url').value = boostImgUrl;
        syncBoostDropzoneFromUrl(boostImgUrl);

        // AutoMod
        if (!currentPermissions.can_messages) lockSection('section-automod', 'Manage Messages');
        currentAutomodConfig = config.automod || {};

        document.getElementById('automod_enabled').checked = currentAutomodConfig.enabled || false;
        document.getElementById('automod_banned_words_enabled').checked = currentAutomodConfig.banned_words?.enabled || false;
        document.getElementById('automod_anti_spam_enabled').checked = currentAutomodConfig.anti_spam?.enabled || false;
        document.getElementById('automod_anti_invites_enabled').checked = currentAutomodConfig.anti_invites?.enabled || false;
        document.getElementById('automod_anti_link_enabled').checked = currentAutomodConfig.anti_link?.enabled || false;
        document.getElementById('automod_anti_caps_enabled').checked = currentAutomodConfig.anti_caps?.enabled || false;
        document.getElementById('automod_mention_spam_enabled').checked = currentAutomodConfig.mention_spam?.enabled || false;
        document.getElementById('automod_anti_alt_enabled').checked = currentAutomodConfig.anti_alt?.enabled || false;

        const amGlobalChEl = document.getElementById('automod_global_channels');
        if (amGlobalChEl.nextElementSibling?.classList.contains('custom-multiselect')) amGlobalChEl.nextElementSibling.remove();
        amGlobalChEl.innerHTML = "";
        globalChannels.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            if (currentAutomodConfig.exempt_channels?.includes(c.id)) opt.selected = true;
            amGlobalChEl.appendChild(opt);
        });
        new CustomMultiSelect(amGlobalChEl, globalChannels, "Select...", (item) => "# " + item.name);

        const amGlobalRoEl = document.getElementById('automod_global_roles');
        if (amGlobalRoEl.nextElementSibling?.classList.contains('custom-multiselect')) amGlobalRoEl.nextElementSibling.remove();
        amGlobalRoEl.innerHTML = "";
        globalRoles.forEach(r => {
            const opt = document.createElement("option");
            opt.value = r.id;
            if (currentAutomodConfig.exempt_roles?.includes(r.id)) opt.selected = true;
            amGlobalRoEl.appendChild(opt);
        });
        new CustomMultiSelect(amGlobalRoEl, globalRoles, "Select...", (item) => `<span class="color-dot" style="background:${item.color}"></span> @ ` + item.name);

        // Verify
        if (!currentPermissions.can_roles) lockSection('section-verify', 'Manage Roles');
        document.getElementById('verify_enabled').checked = config.verify?.enabled || false;
        document.getElementById('verify_type').value = config.verify?.verification_type || 'captcha';
        document.getElementById('verify_timeout_action').value = config.verify?.timeout_action || 'none';
        document.getElementById('verify_timeout_minutes').value = config.verify?.timeout_minutes || '';

        // Ticket
        if (!currentPermissions.can_channels) lockSection('section-ticket', 'Manage Channels');
        document.getElementById('ticket_enabled').checked = config.ticket?.enabled || false;
        document.getElementById('ticket_panel_title').value = config.ticket?.panel_title || 'Support Ticket Desk';
        document.getElementById('ticket_panel_description').value = config.ticket?.panel_description || 'Click the button below to open a direct support channel with our team.';
        document.getElementById('ticket_panel_instructions').value = config.ticket?.panel_instructions || '> Select your desired inquiry category in the dropdown menu below, then click **Create Ticket** to open your private channel.';
        document.getElementById('ticket_panel_channel').value = config.ticket?.panel_channel_id || '';
        document.getElementById('ticket_log_channel_id').value = config.ticket?.log_channel_id || '';

        // Logs
        if (!currentPermissions.can_channels) lockSection('section-logs', 'Manage Channels');
        document.getElementById('logs_enabled').checked = config.logs?.enabled || false;
        document.getElementById('logs_executor_in_logs').checked = config.logs?.executor_in_logs || false;

        const logsGrid = document.getElementById('logs-grid');
        logsGrid.innerHTML = '';
        LOGS_CATEGORIES.forEach(cat => {
            const isEnabled = config.logs?.categories?.[cat.id] || false;
            const selectedCh = config.logs?.channels?.[cat.id] || '';
            const selectedRole = config.logs?.roles?.[cat.id] || '';

            const checked = isEnabled ? 'checked' : '';

            logsGrid.innerHTML += `
                <div class="automod-rule-card">
                    <div class="am-card-header">
                        <div class="am-card-title">
                            <span style="display: flex; align-items: center; justify-content: center; color: var(--accent-primary); width: 24px; height: 24px; margin-right: 8px;">${cat.icon}</span>
                            <h4>${cat.title}</h4>
                        </div>
                        <label class="switch">
                            <input type="checkbox" id="log_cat_${cat.id}_enabled" ${checked}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="form-group" style="margin-top: 16px; margin-bottom: 0;">
                        <label style="color: var(--text-secondary); font-size: 12px; margin-bottom: 8px;">Log Channel</label>
                        <input type="hidden" id="log_cat_${cat.id}_channel">
                    </div>
                    <div class="form-group" style="margin-top: 12px; margin-bottom: 0;">
                        <label style="color: var(--text-secondary); font-size: 12px; margin-bottom: 8px;">Ping Role</label>
                        <input type="hidden" id="log_cat_${cat.id}_role">
                    </div>
                </div>
            `;
        });
        lucide.createIcons({ root: logsGrid });

        // Clear existing custom selects
        document.querySelectorAll('.custom-select').forEach(el => el.remove());
        document.querySelectorAll('.custom-multiselect').forEach(el => el.remove());

        // Initialize Custom Selects for Logs
        LOGS_CATEGORIES.forEach(cat => {
            const selectedCh = config.logs?.channels?.[cat.id] || '';
            const selectedRole = config.logs?.roles?.[cat.id] || '';
            new CustomSelect(document.getElementById(`log_cat_${cat.id}_channel`), globalChannels, selectedCh, '-- Disabled --', false);
            new CustomSelect(document.getElementById(`log_cat_${cat.id}_role`), globalRoles, selectedRole, '-- No Role --', true);
        });

        // Initialize Custom Selects for Roles
        new CustomSelect(document.getElementById('verify_role_id'), globalRoles, config.verify?.role_id || '', 'Select Verified Role...');
        new CustomSelect(document.getElementById('verify_remove_role_id'), globalRoles, config.verify?.remove_role_id || '', 'Select Unverified Role...');

        // Populate Global Channels and Roles Multi-Selects


        const logsChannelsEl = document.getElementById('logs_global_channels');
        logsChannelsEl.innerHTML = "";
        globalChannels.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            if (config.logs?.global_exempt_channels?.includes(c.id)) opt.selected = true;
            logsChannelsEl.appendChild(opt);
        });

        const logsRolesEl = document.getElementById('logs_global_roles');
        logsRolesEl.innerHTML = "";
        globalRoles.forEach(r => {
            const opt = document.createElement("option");
            opt.value = r.id;
            if (config.logs?.global_exempt_roles?.includes(r.id)) opt.selected = true;
            logsRolesEl.appendChild(opt);
        });


        new CustomMultiSelect(logsChannelsEl, globalChannels, "Select...", (item) => "# " + item.name);
        new CustomMultiSelect(logsRolesEl, globalRoles, "Select...", (item) => `<span class="color-dot" style="background:${item.color}"></span> @ ` + item.name);

        // AutoResponder & JoinRoles & TicketOptions
        if (!currentPermissions.can_messages) lockSection('section-autoresponder', 'Manage Messages');
        renderAutoReplies(config.autoresponder || {});

        if (!currentPermissions.can_roles) lockSection('section-joinroles', 'Manage Roles');
        const arUserEl = document.getElementById('autoroles_user');
        const arBotEl = document.getElementById('autoroles_bot');
        arUserEl.innerHTML = "";
        arBotEl.innerHTML = "";
        globalRoles.forEach(r => {
            const optU = document.createElement("option");
            optU.value = r.id;
            if (config.joinroles?.user_roles?.includes(r.id)) optU.selected = true;
            arUserEl.appendChild(optU);

            const optB = document.createElement("option");
            optB.value = r.id;
            if (config.joinroles?.bot_roles?.includes(r.id)) optB.selected = true;
            arBotEl.appendChild(optB);
        });
        document.getElementById('autoroles_enabled').checked = config.joinroles?.enabled ?? false;
        new CustomMultiSelect(arUserEl, globalRoles, "Select...", (item) => `<span class="color-dot" style="background:${item.color}"></span> @ ` + item.name);
        new CustomMultiSelect(arBotEl, globalRoles, "Select...", (item) => `<span class="color-dot" style="background:${item.color}"></span> @ ` + item.name);

        renderTicketOptions(config.ticket?.options_slots || []);

        // Automation
        if (!currentPermissions.can_channels) lockSection('section-automation', 'Manage Channels');
        const autoMediaChEl = document.getElementById('auto_media_channels');
        autoMediaChEl.innerHTML = "";
        globalChannels.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            if (config.automation?.media_only?.channels?.includes(c.id)) opt.selected = true;
            autoMediaChEl.appendChild(opt);
        });
        document.getElementById('auto_media_ignore_bots').checked = config.automation?.media_only?.ignore_bots ?? true;

        const autoCmdChEl = document.getElementById('auto_cmd_channels');
        autoCmdChEl.innerHTML = "";
        globalChannels.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            if (config.automation?.command_only?.channels?.includes(c.id)) opt.selected = true;
            autoCmdChEl.appendChild(opt);
        });

        new CustomMultiSelect(autoMediaChEl, globalChannels, "Select...", (item) => "# " + item.name);
        new CustomMultiSelect(autoCmdChEl, globalChannels, "Select...", (item) => "# " + item.name);

        // Auto Ban Channel
        const autoBanChEl = document.getElementById('auto_ban_channel');
        autoBanChEl.innerHTML = '<option value="">Select Channel...</option>';
        globalChannels.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            opt.textContent = "# " + c.name;
            if (config.automation?.auto_ban?.channel_id === c.id) opt.selected = true;
            autoBanChEl.appendChild(opt);
        });

        const autoBanRolesEl = document.getElementById('auto_ban_exempt_roles');
        autoBanRolesEl.innerHTML = "";
        globalRoles.forEach(r => {
            const opt = document.createElement("option");
            opt.value = r.id;
            if (config.automation?.auto_ban?.exempt_roles?.includes(r.id)) opt.selected = true;
            autoBanRolesEl.appendChild(opt);
        });
        new CustomMultiSelect(autoBanRolesEl, globalRoles, "Select Roles...", (item) => `<div style="display:flex;align-items:center;gap:6px;"><div style="width:12px;height:12px;border-radius:50%;background:${item.color !== '#000000' ? item.color : '#99aab5'};"></div>${item.name}</div>`);

        const autoBanUsersEl = document.getElementById('auto_ban_exempt_users');
        if (autoBanUsersEl) {
            autoBanUsersEl.value = config.automation?.auto_ban?.exempt_users?.join(', ') || '';
        }

        const autoBanMsgEl = document.getElementById('auto_ban_message');
        if (autoBanMsgEl) {
            autoBanMsgEl.value = config.automation?.auto_ban?.message || "# :warning: POSTING IN THIS CHANNEL WILL GET YOU BANNED. :hammer:\n## DO NOT SEND ANY MESSAGES HERE, OR YOU WILL BE __IRREVERSIBLY BANNED.__\n:no_entry_sign: THIS IS A TRAP FOR COMPROMISED ACCOUNTS.\n\n:information_source: Messages posted here will be **automatically** deleted, and the sender will be **automatically** banned by this bot.\n\n**YOU HAVE BEEN WARNED. INTENTIONALLY SENDING MESSAGES WILL GET YOU BANNED WITH NO APPEALS.**\nBan Counter: `{count}`";
        }

        const btnSendHoneypot = document.getElementById('btn-send-honeypot');
        if (btnSendHoneypot) {
            btnSendHoneypot.onclick = async () => {
                const channelId = document.getElementById('auto_ban_channel').value;
                if (!channelId) return showToast("Please select a Honeypot Channel first.");
                const message = document.getElementById('auto_ban_message').value;
                try {
                    const res = await fetch(`/api/action/${currentGuildId}/send_honeypot`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ channel_id: channelId, message: message })
                    });
                    const data = await res.json();
                    if (data.success) {
                        showToast("Honeypot message sent!");
                    } else {
                        showToast(data.error || "Failed to send honeypot message.");
                    }
                } catch (e) {
                    showToast("Error sending message.");
                }
            };
        }

        renderFileChannels(config.automation?.file_only || []);
        renderAutoReactions(config.automation?.auto_reaction || []);

        // Temp Voice
        if (!currentPermissions.can_channels) lockSection('section-tempvoice', 'Manage Channels');
        document.getElementById('tempvoice-enabled').checked = config.tempvoice?.enabled ?? false;
        renderTempVoiceHubs(config.tempvoice || {});

        // Level System
        document.getElementById('level_enabled').checked = config.level?.enabled || false;
        document.getElementById('level_msg_xp_enabled').checked = config.level?.msg_xp_enabled ?? true;
        document.getElementById('level_msg_xp_amount').value = config.level?.msg_xp_amount ?? 20;
        document.getElementById('level_msg_xp_cooldown').value = config.level?.msg_xp_cooldown ?? 60;
        document.getElementById('level_voice_xp_enabled').checked = config.level?.voice_xp_enabled ?? false;
        document.getElementById('level_voice_xp_ignore_muted').checked = config.level?.voice_xp_ignore_muted ?? true;
        document.getElementById('level_voice_xp_ignore_solo').checked = config.level?.voice_xp_ignore_solo ?? false;
        document.getElementById('level_voice_xp_amount').value = config.level?.voice_xp_amount ?? 6;
        document.getElementById('level_cmd_xp_enabled').checked = config.level?.cmd_xp_enabled ?? true;
        document.getElementById('level_cmd_xp_amount').value = config.level?.cmd_xp_amount ?? 15;
        document.getElementById('level_cmd_xp_cooldown').value = config.level?.cmd_xp_cooldown ?? 60;
        document.getElementById('level_react_xp_enabled').checked = config.level?.react_xp_enabled ?? true;
        document.getElementById('level_react_xp_amount').value = config.level?.react_xp_amount ?? 15;
        document.getElementById('level_react_xp_cooldown').value = config.level?.react_xp_cooldown ?? 300;
        document.getElementById('level_reset_on_leave').checked = config.level?.reset_on_leave ?? false;
        document.getElementById('level_reset_on_ban').checked = config.level?.reset_on_ban ?? false;
        document.getElementById('level_vote_boost').checked = config.level?.vote_boost ?? true;
        const xpMul = config.level?.xp_multiplier ?? 1.0;
        document.getElementById('level_xp_multiplier').value = xpMul;
        document.getElementById('level_xp_multiplier_display').textContent = 'x' + parseFloat(xpMul).toFixed(2);
        document.getElementById('level_levelup_conditional').value = config.level?.levelup_conditional || '';
        document.getElementById('level_levelup_show_avatar').checked = config.level?.levelup_show_avatar ?? true;
        document.getElementById('level_levelup_message_content').value = config.level?.levelup_message_content || '{user_mention}';
        document.getElementById('level_levelup_embed_author').value = config.level?.levelup_embed_author || '';
        document.getElementById('level_levelup_embed_title').value = config.level?.levelup_embed_title || '🎉 Level Up!';
        document.getElementById('level_levelup_embed_description').value = config.level?.levelup_embed_description || 'Congratulations **{user_globalname}**!\nYou reached **Level {level}**.';
        document.getElementById('level_levelup_embed_image').value = config.level?.levelup_embed_image || '';
        document.getElementById('level_levelup_embed_footer').value = config.level?.levelup_embed_footer || '';
        document.getElementById('level_roles_stack').checked = config.level?.level_roles_stack ?? false;
        document.getElementById('level_roles_rejoin').checked = config.level?.level_roles_rejoin ?? false;
        document.getElementById('level_role_boosters_stack').checked = config.level?.role_boosters_stack ?? true;
        document.getElementById('level_stat_roles_msg_stack').checked = config.level?.stat_roles_msg_stack ?? false;
        document.getElementById('level_stat_roles_msg_cooldown').value = config.level?.stat_roles_msg_cooldown ?? 5;
        document.getElementById('level_stat_roles_voice_stack').checked = config.level?.stat_roles_voice_stack ?? false;
        document.getElementById('level_stat_roles_voice_cooldown').value = config.level?.stat_roles_voice_cooldown ?? 5;
        document.getElementById('level_stat_roles_react_stack').checked = config.level?.stat_roles_react_stack ?? false;
        document.getElementById('level_stat_roles_react_cooldown').value = config.level?.stat_roles_react_cooldown ?? 5;
        document.getElementById('level_leaderboard_url').value = config.level?.leaderboard_url || '';
        document.getElementById('level_leaderboard_color').value = config.level?.leaderboard_color || '#3B82F6';
        document.getElementById('level_channel_mode').value = config.level?.channel_mode || 'blacklist';
        document.getElementById('level_role_mode').value = config.level?.role_mode || 'blacklist';

        // Populate Level System Channel Selects
        const levelUpChEl = document.getElementById('level_levelup_channel');
        levelUpChEl.innerHTML = '<option value="current">Current Channel</option>';
        const levelLbChEl = document.getElementById('level_leaderboard_channel');
        levelLbChEl.innerHTML = '<option value="">Select Channel...</option>';
        const levelBlockChPicker = document.getElementById('level_blocked_channels_picker');
        levelBlockChPicker.innerHTML = '<option value="">Select a channel...</option>';
        globalChannels.forEach(c => {
            levelUpChEl.innerHTML += `<option value="${c.id}" ${config.level?.levelup_channel == c.id ? 'selected' : ''}>#${c.name}</option>`;
            levelLbChEl.innerHTML += `<option value="${c.id}" ${config.level?.leaderboard_channel == c.id ? 'selected' : ''}>#${c.name}</option>`;
            levelBlockChPicker.innerHTML += `<option value="${c.id}"># ${c.name}</option>`;
        });
        // Init blocked channels chips
        initChipPicker('level_blocked_channels_picker', 'level_blocked_channels_tags', 'level_blocked_channels', config.level?.blocked_channels || [], '#');

        const levelBlockRoPicker = document.getElementById('level_blocked_roles_picker');
        levelBlockRoPicker.innerHTML = '<option value="">Select a role...</option>';
        globalRoles.forEach(r => {
            levelBlockRoPicker.innerHTML += `<option value="${r.id}">@ ${r.name}</option>`;
        });
        // Init blocked roles chips
        initChipPicker('level_blocked_roles_picker', 'level_blocked_roles_tags', 'level_blocked_roles', config.level?.blocked_roles || [], '@');

        // Render dynamic lists
        renderLevelRoles(config.level?.level_roles || []);
        renderStatRoles('msg', config.level?.stat_roles_msg || []);
        renderStatRoles('voice', config.level?.stat_roles_voice || []);
        renderStatRoles('react', config.level?.stat_roles_react || []);
        renderBoosters('role', config.level?.role_boosters || []);
        renderBoosters('channel', config.level?.channel_boosters || []);

        // Initial Preview Update
        updateLivePreview();

        // Capture initial state for checkDirty
        document.querySelectorAll('input, textarea, select').forEach(el => {
            if (el.id === 'chart_days_select' || el.classList.contains('custom-multiselect-input') || el.classList.contains('custom-select-input') || !el.id) return;
            if (el.type === 'checkbox') {
                el.dataset.initial = el.checked;
            } else if (el.type !== 'file' && el.type !== 'hidden') {
                el.dataset.initial = el.value;
            }
        });
        if (typeof window.clearDirtyTracking === 'function') {
            window.clearDirtyTracking();
        } else {
            setDirty(false);
        }

        document.getElementById('config-loader').classList.add('hidden');
        document.getElementById('config-layout').style.display = 'flex';
    } catch (e) {
        document.getElementById('config-layout').innerHTML = '<div style="display: flex; height: 100vh; width: 100%; align-items: center; justify-content: center;"><p style="color:var(--accent-color); font-weight: 600;">Fehler beim Laden der Konfiguration.</p></div>';
        document.getElementById('config-layout').style.display = 'block';
    }
}

// Action: Send Verify Panel
document.getElementById('btn-send-verify').addEventListener('click', async () => {
    const channelId = document.getElementById('verify_panel_channel').value;
    if (!channelId) {
        showToast("Please select a channel first.");
        return;
    }

    const btn = document.getElementById('btn-send-verify');
    btn.innerText = 'Sending...';
    btn.disabled = true;

    try {
        const res = await fetch(`/api/action/${currentGuildId}/send_verify_panel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channel_id: channelId })
        });

        if (res.ok) {
            showToast('Verification Panel successfully sent to the channel!');
        } else {
            const data = await res.json();
            showToast('Failed: ' + (data.error || 'Unknown error'));
        }
    } catch (e) {
        showToast('An error occurred.');
    } finally {
        btn.innerText = 'Send Panel';
        btn.disabled = false;
    }
});

// Sidebar Navigation
document.querySelectorAll('.dash-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.dash-nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.dash-panel').forEach(sec => sec.classList.remove('active'));

        item.classList.add('active');
        document.getElementById(item.dataset.target).classList.add('active');
    });
});

document.getElementById('btn-back').addEventListener('click', () => {
    loadDashboard();
});

function updateLivePreview() {
    const msgInput = document.getElementById('welcome_message').value;
    const imgInput = document.getElementById('welcome_image_url').value;

    // Replace placeholders and #channel-name mentions
    let formattedText = msgInput
        .replace(/#([\w-]+)/g, '<span style="color: #5865F2; font-weight: 500;">#$1</span>')
        .replace(/{user}/g, '<span style="background: rgba(88, 101, 242, 0.3); color: #C9CDFB; padding: 0 2px; border-radius: 3px;">@user</span>')
        .replace(/{server}/g, '<b>Orbit</b>')
        .replace(/{count}/g, '<b>100</b>');

    document.getElementById('welcome_preview_text').innerHTML = formattedText || '<i>No message configured</i>';

    const imgElement = document.getElementById('welcome_preview_img');

    if (imgInput) {
        imgElement.src = imgInput;
        imgElement.style.display = 'block';
    } else {
        imgElement.style.display = 'none';
        imgElement.src = '';
    }
}

function updateGoodbyeLivePreview() {
    const msgInput = document.getElementById('goodbye_message').value;
    const imgInput = document.getElementById('goodbye_image_url').value;

    // Replace placeholders and #channel-name mentions
    let formattedText = msgInput
        .replace(/#([\w-]+)/g, '<span style="color: #5865F2; font-weight: 500;">#$1</span>')
        .replace(/{user}/g, '<span style="background: rgba(88, 101, 242, 0.3); color: #C9CDFB; padding: 0 2px; border-radius: 3px;">@user</span>')
        .replace(/{server}/g, '<b>Orbit</b>')
        .replace(/{count}/g, '<b>100</b>');

    document.getElementById('goodbye_preview_text').innerHTML = formattedText || '<i>No message configured</i>';

    const imgElement = document.getElementById('goodbye_preview_img');

    if (imgInput) {
        imgElement.src = imgInput;
        imgElement.style.display = 'block';
    } else {
        imgElement.style.display = 'none';
        imgElement.src = '';
    }
}

function syncDropzoneFromUrl(url) {
    const preview = document.getElementById('dropzone-preview');
    const inner = document.getElementById('dropzone-inner');
    if (url) {
        preview.src = url;
        preview.style.display = 'block';
        if (inner) inner.style.display = 'none';
    } else {
        preview.style.display = 'none';
        preview.src = '';
        if (inner) inner.style.display = 'flex';
    }
    updateLivePreview();
}

function syncGoodbyeDropzoneFromUrl(url) {
    const preview = document.getElementById('goodbye-dropzone-preview');
    const inner = document.getElementById('goodbye-dropzone-inner');
    if (url) {
        preview.src = url;
        preview.style.display = 'block';
        if (inner) inner.style.display = 'none';
    } else {
        preview.style.display = 'none';
        preview.src = '';
        if (inner) inner.style.display = 'flex';
    }
    updateGoodbyeLivePreview();
}

function updateBoostLivePreview() {
    const msgInput = document.getElementById('boost_message').value;
    const imgInput = document.getElementById('boost_image_url').value;

    // Replace placeholders and #channel-name mentions
    let formattedText = msgInput
        .replace(/#([\w-]+)/g, '<span style="color: #5865F2; font-weight: 500;">#$1</span>')
        .replace(/{user}/g, '<span style="background: rgba(88, 101, 242, 0.3); color: #C9CDFB; padding: 0 2px; border-radius: 3px;">@user</span>')
        .replace(/{server}/g, '<b>Orbit</b>')
        .replace(/{count}/g, '<b>100</b>');

    document.getElementById('boost_preview_text').innerHTML = formattedText || '<i>No message configured</i>';

    const imgElement = document.getElementById('boost_preview_img');

    if (imgInput) {
        imgElement.src = imgInput;
        imgElement.style.display = 'block';
    } else {
        imgElement.style.display = 'none';
        imgElement.src = '';
    }
}

function syncBoostDropzoneFromUrl(url) {
    const preview = document.getElementById('boost-dropzone-preview');
    const inner = document.getElementById('boost-dropzone-inner');
    if (url) {
        preview.src = url;
        preview.style.display = 'block';
        if (inner) inner.style.display = 'none';
    } else {
        preview.style.display = 'none';
        preview.src = '';
        if (inner) inner.style.display = 'flex';
    }
    updateBoostLivePreview();
}

function renderTempVoiceHubs(tvConfig) {
    const container = document.getElementById('tempvoice-hubs-container');
    if (!container) return;

    container.innerHTML = '';
    const hubs = tvConfig.hubs || [];

    if (hubs.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary); font-size:14px; margin:0;" id="tv-empty-text">No Temp Voice Hubs configured.</p>';
    } else {
        hubs.forEach(hub => addTempVoiceHubRow(hub));
    }
    updateAddTempVoiceButton();
}

function updateAddTempVoiceButton() {
    const container = document.getElementById('tempvoice-hubs-container');
    const btn = document.getElementById('btn-add-tempvoice-hub');
    if (!container || !btn) return;
    const count = container.querySelectorAll('.tempvoice-hub-row').length;
    if (count >= 5) {
        btn.style.display = 'none';
    } else {
        btn.style.display = 'inline-block';
    }
}

function addTempVoiceHubRow(hub = { hub_channel_id: '', category_id: '', default_user_limit: 0 }) {
    const container = document.getElementById('tempvoice-hubs-container');
    if (container.querySelector('#tv-empty-text')) container.innerHTML = '';

    if (container.querySelectorAll('.tempvoice-hub-row').length >= 5) {
        showToast("Maximum of 5 Temp Voice Hubs reached.");
        return;
    }

    const row = document.createElement('div');
    row.className = 'tempvoice-hub-row config-card';
    row.style.cssText = 'padding: 15px; display: flex; flex-direction: column; gap: 12px; margin-bottom: 0; position: relative;';

    row.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px;">
                <label style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; display: block;">Hub Voice Channel</label>
                <input type="hidden" class="tv-hub-channel" value="${hub.hub_channel_id || ''}">
            </div>
            <div style="flex: 1; min-width: 200px;">
                <label style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; display: block;">Temp Channel Category</label>
                <input type="hidden" class="tv-hub-category" value="${hub.category_id || ''}">
            </div>
            <div style="flex: 0 1 120px;">
                <label style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px; display: block;">User Limit</label>
                <input type="number" class="tv-hub-limit form-input" min="0" max="99" value="${hub.default_user_limit || 0}" placeholder="0" style="margin-bottom: 0; height: 38px;">
            </div>
            <button type="button" class="btn-danger btn-remove-hub" style="padding: 0 12px; font-size: 16px; height: 38px;">
                <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
            </button>
        </div>
    `;

    const channelInput = row.querySelector('.tv-hub-channel');
    const categoryInput = row.querySelector('.tv-hub-category');

    new CustomSelect(channelInput, globalVoiceChannels, hub.hub_channel_id || '', '-- Select Voice Channel --');
    new CustomSelect(categoryInput, globalCategories, hub.category_id || '', '-- Same as Hub --');

    row.querySelector('.btn-remove-hub').onclick = () => {
        row.remove();
        if (container.querySelectorAll('.tempvoice-hub-row').length === 0) {
            container.innerHTML = '<p style="color:var(--text-secondary); font-size:14px; margin:0;" id="tv-empty-text">No Temp Voice Hubs configured.</p>';
        }
        updateAddTempVoiceButton();
    };

    container.appendChild(row);
    lucide.createIcons({ root: row });
    updateAddTempVoiceButton();
}

document.getElementById('btn-add-tempvoice-hub')?.addEventListener('click', () => {
    addTempVoiceHubRow();
});

// Dropzone setup
function bindDropzone(zoneId, fileInputId, urlInputId, syncFunc) {
    const zone = document.getElementById(zoneId);
    const fileInput = document.getElementById(fileInputId);
    const urlInput = document.getElementById(urlInputId);

    if (!zone || !fileInput || !urlInput) return;

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) uploadImageFile(file);
    });
    zone.addEventListener('click', (e) => {
        fileInput.click();
    });
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) uploadImageFile(fileInput.files[0]);
    });

    async function uploadImageFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload/image', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                urlInput.value = data.url;
                syncFunc(data.url);
                showToast('Image uploaded successfully!');
            } else {
                showToast('Upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            showToast('Upload error.');
        }
    }
}

bindDropzone('image-dropzone', 'image-file-input', 'welcome_image_url', syncDropzoneFromUrl);
bindDropzone('goodbye-image-dropzone', 'goodbye-image-file-input', 'goodbye_image_url', syncGoodbyeDropzoneFromUrl);
bindDropzone('boost-image-dropzone', 'boost-image-file-input', 'boost_image_url', syncBoostDropzoneFromUrl);

document.getElementById('welcome_message').addEventListener('input', updateLivePreview);
document.getElementById('welcome_image_url').addEventListener('input', () => syncDropzoneFromUrl(document.getElementById('welcome_image_url').value));

document.getElementById('goodbye_message').addEventListener('input', updateGoodbyeLivePreview);
document.getElementById('goodbye_image_url').addEventListener('input', () => syncGoodbyeDropzoneFromUrl(document.getElementById('goodbye_image_url').value));

document.getElementById('boost_message').addEventListener('input', updateBoostLivePreview);
document.getElementById('boost_image_url').addEventListener('input', () => syncBoostDropzoneFromUrl(document.getElementById('boost_image_url').value));

document.getElementById('btn-send-ticket').addEventListener('click', async () => {
    if (!currentGuildId) return;
    const channelId = document.getElementById('ticket_panel_channel').value;
    if (!channelId) {
        showToast("Please select a channel to send the ticket panel to.");
        return;
    }

    try {
        const res = await fetch(`/api/action/${currentGuildId}/send_ticket_panel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channel_id: channelId })
        });
        if (res.ok) showToast("Ticket Panel sent successfully!");
        else showToast("Failed to send Ticket Panel.");
    } catch (e) {
        showToast("Error sending panel.");
    }
});

// AutoMod Modal Functions
function openAutoModModal(ruleId) {
    activeAutomodRule = ruleId;
    const ruleCfg = currentAutomodConfig[ruleId] || {};

    let title = '';
    let html = '';

    const actionSelect = `
        <div class="form-group" style="margin-top: 15px;">
            <label>Punishment</label>
            <span style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px;">Action applied when the rule is triggered.</span>
            <select id="am-modal-action">
                <option value="warn" ${ruleCfg.action === 'warn' ? 'selected' : ''}>Warning</option>
                <option value="timeout" ${ruleCfg.action === 'timeout' ? 'selected' : ''}>Timeout</option>
                <option value="kick" ${ruleCfg.action === 'kick' ? 'selected' : ''}>Kick</option>
                <option value="ban" ${ruleCfg.action === 'ban' ? 'selected' : ''}>Ban</option>
            </select>
        </div>
        <div class="form-group" id="am-modal-timeout-group" style="margin-bottom: 0;">
            <label>Timeout (Minutes)</label>
            <input type="number" id="am-modal-timeout" min="1" max="10080" value="${ruleCfg.timeout_duration_min || 5}">
        </div>
    `;

    let exceptionsHtml = '';
    if (ruleId !== 'anti_alt') {
        const selCh = ruleCfg.exempt_channels || [];
        const selRo = ruleCfg.exempt_roles || [];

        let chOptions = '';
        globalChannels.forEach(c => {
            const sel = selCh.includes(c.id) ? 'selected' : '';
            chOptions += `<option value="${c.id}" ${sel}>#${c.name}</option>`;
        });

        let roOptions = '';
        globalRoles.forEach(r => {
            const sel = selRo.includes(r.id) ? 'selected' : '';
            roOptions += `<option value="${r.id}" ${sel}>@${r.name}</option>`;
        });

        exceptionsHtml = `
            <div class="form-group" style="margin-top:20px;">
                <label>Allowed Channels</label>
                <span style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px;">Channels excluded from this rule.</span>
                <select id="am-modal-channels" multiple>${chOptions}</select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>Allowed Roles</label>
                <span style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px;">Roles excluded from this rule.</span>
                <select id="am-modal-roles" multiple>${roOptions}</select>
                <p style="color:var(--accent-color); font-size:11px; margin-top:8px; margin-bottom:0;">Members with Administrator or Manage Server permissions are always ignored.</p>
            </div>
        `;
    }

    if (ruleId === 'banned_words') {
        title = 'Banned Words';
        const words = ruleCfg.words || [];
        html = `
            <div class="form-group">
                <label>Banned Words</label>
                <span style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px;">Words or phrases to block.</span>
                <input type="text" id="am-modal-words" value="${words.join(', ')}" placeholder="badword1, badword2">
                <p style="color:var(--accent-color); font-size:12px; margin-top:8px;">Use * at the start, end, or both for partial matches.</p>
            </div>
            ${actionSelect}
            ${exceptionsHtml}
        `;
    } else if (ruleId === 'anti_spam') {
        title = 'Anti Spam';
        html = `
            <div style="display:flex; gap:12px; flex-wrap:wrap;">
                <div class="form-group" style="flex:1;">
                    <label>Message Count</label>
                    <span style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px;">The number of messages to trigger the rule.</span>
                    <input type="number" id="am-modal-msgs" min="2" max="100" value="${ruleCfg.max_messages || 5}">
                </div>
                <div class="form-group" style="flex:1;">
                    <label>Time Window</label>
                    <span style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px;">The time window in seconds.</span>
                    <input type="number" id="am-modal-window" min="1" max="60" value="${ruleCfg.time_window_sec || 3}">
                </div>
            </div>
            ${actionSelect}
            ${exceptionsHtml}
        `;
    } else if (ruleId === 'anti_invites') {
        title = 'Anti Invites';
        html = actionSelect + exceptionsHtml;
    } else if (ruleId === 'anti_link') {
        title = 'Anti Links';
        const domains = ruleCfg.blocked_domains || ["discord.gg/", "discord.com/invite/"];
        html = `
            <div class="form-group">
                <label>Blocked Links</label>
                <span style="display:block; font-size:12px; color:var(--text-muted); margin-bottom:8px;">The domains to block.</span>
                <input type="text" id="am-modal-domains" value="${domains.join(', ')}">
            </div>
            ${actionSelect}
            ${exceptionsHtml}
        `;
    } else if (ruleId === 'anti_caps') {
        title = 'Anti Caps';
        html = actionSelect + exceptionsHtml;
    } else if (ruleId === 'mention_spam') {
        title = 'Mention Spam';
        html = `
            <div class="form-group">
                <label>Max Mentions</label>
                <input type="number" id="am-modal-mentions" min="2" max="50" value="${ruleCfg.max_mentions || 4}">
            </div>
            ${actionSelect}
            ${exceptionsHtml}
        `;
    } else if (ruleId === 'anti_alt') {
        title = 'Anti-Alt Account';
        html = `
            <div class="form-group">
                <label>Minimum Account Age (days)</label>
                <input type="number" id="am-modal-age" min="1" max="365" value="${ruleCfg.min_age_days || 3}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Action on Violation</label>
                <select id="am-modal-action-alt">
                    <option value="kick" ${ruleCfg.action === 'kick' ? 'selected' : ''}>Kick</option>
                    <option value="ban" ${ruleCfg.action === 'ban' ? 'selected' : ''}>Ban</option>
                    <option value="verify" ${ruleCfg.action === 'verify' ? 'selected' : ''}>Force Verify (Quarantine Role)</option>
                </select>
            </div>
        `;
    }

    document.getElementById('am-modal-title').innerText = title;
    document.getElementById('am-modal-body').innerHTML = html;

    if (ruleId !== 'anti_alt') {
        new CustomMultiSelect(document.getElementById('am-modal-channels'), globalChannels, "Select...", (item) => "# " + item.name);
        new CustomMultiSelect(document.getElementById('am-modal-roles'), globalRoles, "Select...", (item) => `<span class="color-dot" style="background:${item.color}"></span> @ ` + item.name);
    }

    const actionEl = document.getElementById('am-modal-action');
    if (actionEl) {
        actionEl.addEventListener('change', (e) => {
            const grp = document.getElementById('am-modal-timeout-group');
            if (grp) grp.style.display = e.target.value === 'timeout' ? '' : 'none';
        });
        const grp = document.getElementById('am-modal-timeout-group');
        if (grp) grp.style.display = actionEl.value === 'timeout' ? '' : 'none';
    }

    lucide.createIcons({ root: document.getElementById('automod-modal') });
    document.getElementById('automod-modal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeAutoModModal() {
    if (activeAutomodRule) {
        if (!currentAutomodConfig[activeAutomodRule]) currentAutomodConfig[activeAutomodRule] = {};
        const ruleCfg = currentAutomodConfig[activeAutomodRule];

        const actionEl = document.getElementById('am-modal-action');
        if (actionEl) ruleCfg.action = actionEl.value;

        const toEl = document.getElementById('am-modal-timeout');
        if (toEl) ruleCfg.timeout_duration_min = parseInt(toEl.value) || 5;

        if (activeAutomodRule === 'banned_words') {
            ruleCfg.words = document.getElementById('am-modal-words').value.split(',').map(s => s.trim()).filter(s => s);
        } else if (activeAutomodRule === 'anti_spam') {
            ruleCfg.max_messages = parseInt(document.getElementById('am-modal-msgs').value) || 5;
            ruleCfg.time_window_sec = parseInt(document.getElementById('am-modal-window').value) || 3;
        } else if (activeAutomodRule === 'anti_link') {
            ruleCfg.blocked_domains = document.getElementById('am-modal-domains').value.split(',').map(s => s.trim()).filter(s => s);
        } else if (activeAutomodRule === 'mention_spam') {
            ruleCfg.max_mentions = parseInt(document.getElementById('am-modal-mentions').value) || 4;
        } else if (activeAutomodRule === 'anti_alt') {
            ruleCfg.min_age_days = parseInt(document.getElementById('am-modal-age').value) || 3;
            const act = document.getElementById('am-modal-action-alt');
            if (act) ruleCfg.action = act.value;
        }

        if (activeAutomodRule !== 'anti_alt') {
            const chEl = document.getElementById('am-modal-channels');
            if (chEl) ruleCfg.exempt_channels = Array.from(chEl.selectedOptions).map(o => o.value);
            const roEl = document.getElementById('am-modal-roles');
            if (roEl) ruleCfg.exempt_roles = Array.from(roEl.selectedOptions).map(o => o.value);
        }
    }

    activeAutomodRule = null;
    document.getElementById('automod-modal').classList.remove('show');
    document.body.style.overflow = '';
}

// Save Settings
document.getElementById('config-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentGuildId) return;

    const btn = document.getElementById('btn-save');
    btn.innerText = 'Saving...';
    btn.disabled = true;

    // Update AutoMod global options
    currentAutomodConfig.exempt_channels = Array.from(document.getElementById('automod_global_channels').selectedOptions).map(o => o.value);
    currentAutomodConfig.exempt_roles = Array.from(document.getElementById('automod_global_roles').selectedOptions).map(o => o.value);

    // Collect AutoResponder Data
    const localAutoresponder = {};
    document.querySelectorAll('.autoreply-row').forEach(row => {
        const trigger = row.querySelector('.ar-trigger').value.trim();
        const response = row.querySelector('.ar-response').value.trim();
        const channelVal = row.querySelector('.ar-channel')?.value || '';
        if (trigger && response) {
            localAutoresponder[trigger] = { response: response, channel_id: channelVal ? channelVal : null };
        }
    });

    // Collect AutoRoles Data
    const joinroles = {
        enabled: document.getElementById('autoroles_enabled').checked,
        user_roles: Array.from(document.getElementById('autoroles_user').selectedOptions).map(o => o.value),
        bot_roles: Array.from(document.getElementById('autoroles_bot').selectedOptions).map(o => o.value)
    };

    // Collect Ticket Options Data
    const ticketOptions = [];
    document.querySelectorAll('.ticket-option-row').forEach(row => {
        const name = row.querySelector('.to-name').value.trim();
        const role_id = row.querySelector('.to-role').value;
        const category_id = row.querySelector('.to-category').value;
        if (name) {
            ticketOptions.push({
                name: name,
                role_id: role_id ? String(role_id) : null,
                category_id: category_id ? String(category_id) : null
            });
        }
    });

    // Collect File Channels
    const fileChannels = [];
    document.querySelectorAll('.fc-row').forEach(row => {
        const channel_id = row.querySelector('.fc-channel').value;
        const extensions = row.querySelector('.fc-extensions').value.trim();
        const ignore_bots = row.querySelector('.fc-ignore').checked;
        if (channel_id) {
            fileChannels.push({ channel_id, extensions, ignore_bots });
        }
    });

    // Collect Auto Reactions
    const autoReactions = [];
    document.querySelectorAll('.ar-row').forEach(row => {
        const channel_id = row.querySelector('.ar-channel-sel').value;
        const emoji = row.querySelector('.ar-emoji').value.trim();
        const ignore_bots = row.querySelector('.ar-ignore').checked;
        if (channel_id && emoji) {
            autoReactions.push({ channel_id, emoji, ignore_bots });
        }
    });

    // Setup Test Level Up Button
    const testLevelUpBtn = document.getElementById('btn-test-levelup');
    if (testLevelUpBtn) {
        testLevelUpBtn.addEventListener('click', async () => {
            const originalText = testLevelUpBtn.textContent;
            testLevelUpBtn.textContent = 'Sending...';
            testLevelUpBtn.disabled = true;
            
            try {
                const levelupChannelId = document.getElementById('level_levelup_channel').value;
                const response = await fetch(`/api/server/${currentGuildId}/test-levelup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        channel_id: levelupChannelId,
                        message: document.getElementById('level_levelup_message_content').value,
                        embed_author: document.getElementById('level_levelup_embed_author').value,
                        embed_title: document.getElementById('level_levelup_embed_title').value,
                        embed_description: document.getElementById('level_levelup_embed_description').value,
                        embed_image: document.getElementById('level_levelup_embed_image').value,
                        embed_footer: document.getElementById('level_levelup_embed_footer').value,
                        show_avatar: document.getElementById('level_levelup_show_avatar').checked
                    })
                });
                
                if (response.ok) {
                    testLevelUpBtn.textContent = 'Sent!';
                    setTimeout(() => { testLevelUpBtn.textContent = originalText; testLevelUpBtn.disabled = false; }, 2000);
                } else {
                    testLevelUpBtn.textContent = 'Failed';
                    setTimeout(() => { testLevelUpBtn.textContent = originalText; testLevelUpBtn.disabled = false; }, 2000);
                }
            } catch (e) {
                console.error(e);
                testLevelUpBtn.textContent = 'Error';
                setTimeout(() => { testLevelUpBtn.textContent = originalText; testLevelUpBtn.disabled = false; }, 2000);
            }
        });
    }

    // Collect AutoMod Toggle States and Global Exepts
    currentAutomodConfig.enabled = document.getElementById('automod_enabled').checked;

    if (!currentAutomodConfig.banned_words) currentAutomodConfig.banned_words = {};
    currentAutomodConfig.banned_words.enabled = document.getElementById('automod_banned_words_enabled').checked;
    if (!currentAutomodConfig.anti_spam) currentAutomodConfig.anti_spam = {};
    currentAutomodConfig.anti_spam.enabled = document.getElementById('automod_anti_spam_enabled').checked;
    if (!currentAutomodConfig.anti_invites) currentAutomodConfig.anti_invites = {};
    currentAutomodConfig.anti_invites.enabled = document.getElementById('automod_anti_invites_enabled').checked;
    if (!currentAutomodConfig.anti_link) currentAutomodConfig.anti_link = {};
    currentAutomodConfig.anti_link.enabled = document.getElementById('automod_anti_link_enabled').checked;
    if (!currentAutomodConfig.anti_caps) currentAutomodConfig.anti_caps = {};
    currentAutomodConfig.anti_caps.enabled = document.getElementById('automod_anti_caps_enabled').checked;
    if (!currentAutomodConfig.mention_spam) currentAutomodConfig.mention_spam = {};
    currentAutomodConfig.mention_spam.enabled = document.getElementById('automod_mention_spam_enabled').checked;
    if (!currentAutomodConfig.anti_alt) currentAutomodConfig.anti_alt = {};
    currentAutomodConfig.anti_alt.enabled = document.getElementById('automod_anti_alt_enabled').checked;



    // Collect Temp Voice Data
    const tvHubs = [];
    document.querySelectorAll('.tempvoice-hub-row').forEach(row => {
        const hid = row.querySelector('.tv-hub-channel').value;
        const cid = row.querySelector('.tv-hub-category').value;
        const limit = row.querySelector('.tv-hub-limit').value;
        if (hid) {
            tvHubs.push({
                hub_channel_id: hid,
                category_id: cid,
                default_user_limit: limit ? parseInt(limit) : 0
            });
        }
    });
    const payload = {
        settings: {
            manager_roles: Array.from(document.getElementById('settings_manager_roles').selectedOptions).map(o => o.value),
            timezone: document.getElementById('settings_timezone').value,
            embed_style: document.getElementById('settings_embed_style').value
        },
        welcome: {
            enabled: document.getElementById('welcome_enabled').checked,
            channel_id: document.getElementById('welcome_channel_id').value,
            message: document.getElementById('welcome_message').value,
            image_url: document.getElementById('welcome_image_url').value
        },
        goodbye: {
            enabled: document.getElementById('goodbye_enabled').checked,
            channel_id: document.getElementById('goodbye_channel_id').value,
            message: document.getElementById('goodbye_message').value,
            image_url: document.getElementById('goodbye_image_url').value
        },
        boost: {
            enabled: document.getElementById('boost_enabled').checked,
            channel_id: document.getElementById('boost_channel_id').value,
            message: document.getElementById('boost_message').value,
            image_url: document.getElementById('boost_image_url').value
        },
        automod: currentAutomodConfig,
        verify: {
            enabled: document.getElementById('verify_enabled').checked,
            role_id: document.getElementById('verify_role_id').value,
            remove_role_id: document.getElementById('verify_remove_role_id').value,
            verification_type: document.getElementById('verify_type').value,
            timeout_action: document.getElementById('verify_timeout_action').value,
            timeout_minutes: document.getElementById('verify_timeout_minutes').value
        },
        ticket: {
            enabled: document.getElementById('ticket_enabled').checked,
            panel_title: document.getElementById('ticket_panel_title').value,
            panel_description: document.getElementById('ticket_panel_description').value,
            panel_instructions: document.getElementById('ticket_panel_instructions').value,
            panel_channel_id: document.getElementById('ticket_panel_channel').value,
            log_channel_id: document.getElementById('ticket_log_channel_id').value,
            options_slots: ticketOptions
        },
        autoresponder: localAutoresponder,
        joinroles: joinroles,
        automation: {
            media_only: {
                channels: Array.from(document.getElementById('auto_media_channels').selectedOptions).map(o => o.value),
                ignore_bots: document.getElementById('auto_media_ignore_bots').checked
            },
            command_only: {
                channels: Array.from(document.getElementById('auto_cmd_channels').selectedOptions).map(o => o.value)
            },
            file_only: fileChannels,
            auto_reaction: autoReactions,
            auto_ban: {
                channel_id: document.getElementById('auto_ban_channel').value,
                exempt_roles: Array.from(document.getElementById('auto_ban_exempt_roles').selectedOptions).map(o => o.value),
                exempt_users: document.getElementById('auto_ban_exempt_users').value.split(',').map(u => u.trim()).filter(u => u.length > 0),
                message: document.getElementById('auto_ban_message').value
            }
        },
        tempvoice: {
            enabled: document.getElementById('tempvoice-enabled')?.checked || false,
            hubs: tvHubs
        },
        level: {
            enabled: document.getElementById('level_enabled').checked,
            msg_xp_enabled: document.getElementById('level_msg_xp_enabled').checked,
            msg_xp_amount: parseInt(document.getElementById('level_msg_xp_amount').value) || 20,
            msg_xp_cooldown: parseInt(document.getElementById('level_msg_xp_cooldown').value) || 60,
            voice_xp_enabled: document.getElementById('level_voice_xp_enabled').checked,
            voice_xp_ignore_muted: document.getElementById('level_voice_xp_ignore_muted').checked,
            voice_xp_ignore_solo: document.getElementById('level_voice_xp_ignore_solo').checked,
            voice_xp_amount: parseInt(document.getElementById('level_voice_xp_amount').value) || 6,
            cmd_xp_enabled: document.getElementById('level_cmd_xp_enabled').checked,
            cmd_xp_amount: parseInt(document.getElementById('level_cmd_xp_amount').value) || 15,
            cmd_xp_cooldown: parseInt(document.getElementById('level_cmd_xp_cooldown').value) || 60,
            react_xp_enabled: document.getElementById('level_react_xp_enabled').checked,
            react_xp_amount: parseInt(document.getElementById('level_react_xp_amount').value) || 15,
            react_xp_cooldown: parseInt(document.getElementById('level_react_xp_cooldown').value) || 300,
            reset_on_leave: document.getElementById('level_reset_on_leave').checked,
            reset_on_ban: document.getElementById('level_reset_on_ban').checked,
            vote_boost: document.getElementById('level_vote_boost').checked,
            xp_multiplier: parseFloat(document.getElementById('level_xp_multiplier').value) || 1.0,
            channel_mode: document.getElementById('level_channel_mode').value,
            role_mode: document.getElementById('level_role_mode').value,
            blocked_channels: document.getElementById('level_blocked_channels').value ? document.getElementById('level_blocked_channels').value.split(',') : [],
            blocked_roles: document.getElementById('level_blocked_roles').value ? document.getElementById('level_blocked_roles').value.split(',') : [],
            levelup_channel: document.getElementById('level_levelup_channel').value,
            leaderboard_url: document.getElementById('level_leaderboard_url').value,
            leaderboard_channel: document.getElementById('level_leaderboard_channel').value,
            leaderboard_color: document.getElementById('level_leaderboard_color').value,
            levelup_conditional: document.getElementById('level_levelup_conditional').value,
            levelup_show_avatar: document.getElementById('level_levelup_show_avatar').checked,
            levelup_message_content: document.getElementById('level_levelup_message_content').value,
            levelup_embed_author: document.getElementById('level_levelup_embed_author').value,
            levelup_embed_title: document.getElementById('level_levelup_embed_title').value,
            levelup_embed_description: document.getElementById('level_levelup_embed_description').value,
            levelup_embed_image: document.getElementById('level_levelup_embed_image').value,
            levelup_embed_footer: document.getElementById('level_levelup_embed_footer').value,
            level_roles_stack: document.getElementById('level_roles_stack').checked,
            level_roles_rejoin: document.getElementById('level_roles_rejoin').checked,
            level_roles: collectLevelRoles(),
            stat_roles_msg_stack: document.getElementById('level_stat_roles_msg_stack').checked,
            stat_roles_msg_cooldown: parseInt(document.getElementById('level_stat_roles_msg_cooldown').value) || 5,
            stat_roles_msg: collectStatRoles('msg'),
            stat_roles_voice_stack: document.getElementById('level_stat_roles_voice_stack').checked,
            stat_roles_voice_cooldown: parseInt(document.getElementById('level_stat_roles_voice_cooldown').value) || 5,
            stat_roles_voice: collectStatRoles('voice'),
            stat_roles_react_stack: document.getElementById('level_stat_roles_react_stack').checked,
            stat_roles_react_cooldown: parseInt(document.getElementById('level_stat_roles_react_cooldown').value) || 5,
            stat_roles_react: collectStatRoles('react'),
            role_boosters_stack: document.getElementById('level_role_boosters_stack').checked,
            role_boosters: collectBoosters('role'),
            channel_boosters: collectBoosters('channel'),
        },
        logs: {
            enabled: document.getElementById('logs_enabled').checked,
            executor_in_logs: document.getElementById('logs_executor_in_logs').checked,
            global_exempt_channels: Array.from(document.getElementById('logs_global_channels').selectedOptions).map(o => o.value),
            global_exempt_roles: Array.from(document.getElementById('logs_global_roles').selectedOptions).map(o => o.value),
            categories: {},
            channels: {},
            roles: {}
        }
    };

    LOGS_CATEGORIES.forEach(cat => {
        const enCb = document.getElementById(`log_cat_${cat.id}_enabled`);
        const chSel = document.getElementById(`log_cat_${cat.id}_channel`);
        const roleSel = document.getElementById(`log_cat_${cat.id}_role`);
        if (enCb) payload.logs.categories[cat.id] = enCb.checked;
        if (chSel) payload.logs.channels[cat.id] = chSel.value;
        if (roleSel) payload.logs.roles[cat.id] = roleSel.value;
    });

    try {
        const res = await fetch(`/api/config/${currentGuildId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showToast('Settings saved successfully!');
            setDirty(false);
        } else {
            const data = await res.json();
            showToast('Error: ' + (data.error || 'Unknown error'));
        }
    } catch (e) {
        showToast('An error occurred while saving.');
    } finally {
        btn.innerText = 'Save Changes';
        btn.disabled = false;
    }
});

function showToast(msg) {
    const toast = document.getElementById('toast');
    if (msg) toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

init();
// Workaround for multiple selects on Windows to behave like toggles
document.addEventListener('mousedown', function (e) {
    if (e.target.tagName === 'OPTION' && e.target.parentElement.hasAttribute('multiple')) {
        e.preventDefault();
        e.target.selected = !e.target.selected;
        e.target.parentElement.dispatchEvent(new Event('change'));
    }
});

// ─── Level System Dynamic Functions ──────────────────────────────────────────

// Number +/- buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('num-btn')) {
        const targetId = e.target.dataset.target;
        const input = document.getElementById(targetId);
        if (!input) return;
        const step = parseInt(input.step) || 1;
        const min = parseInt(input.min) || 0;
        const max = parseInt(input.max) || 99999;
        let val = parseInt(input.value) || 0;
        if (e.target.classList.contains('plus')) val = Math.min(max, val + step);
        else val = Math.max(min, val - step);
        input.value = val;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
});

// XP Multiplier slider display
document.getElementById('level_xp_multiplier')?.addEventListener('input', function() {
    document.getElementById('level_xp_multiplier_display').textContent = 'x' + parseFloat(this.value).toFixed(2);
});

// Toggle tabs (Blacklist/Whitelist and Stat tabs)
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('toggle-tab')) {
        const parent = e.target.closest('.toggle-tabs');
        parent.querySelectorAll('.toggle-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');

        // Handle mode tabs (blacklist/whitelist)
        const targetMode = e.target.dataset.targetMode;
        if (targetMode) {
            document.getElementById(targetMode).value = e.target.dataset.mode;
        }

        // Handle stat tabs (messages/voice/reactions)
        const statTab = e.target.dataset.statTab;
        if (statTab) {
            document.querySelectorAll('.stat-tab-content').forEach(el => el.style.display = 'none');
            document.getElementById('stat-tab-' + statTab).style.display = '';
        }
    }
});

// ─── Level Roles ─────────────────────────────────────────────────────────────
function renderLevelRoles(roles) {
    const container = document.getElementById('level-roles-list');
    if (!roles.length) {
        container.innerHTML = '<div class="reward-empty">No rewards configured.</div>';
        return;
    }
    container.innerHTML = '';
    roles.forEach((r, i) => {
        const row = document.createElement('div');
        row.className = 'reward-row';
        row.innerHTML = `
            <input type="number" class="lr-level" value="${r.level || 1}" min="1" max="200">
            <select class="lr-role">${globalRoles.map(gr => `<option value="${gr.id}" ${gr.id == r.role_id ? 'selected' : ''}>@ ${gr.name}</option>`).join('')}</select>
            <button type="button" class="btn-remove" data-idx="${i}">Remove</button>
        `;
        row.querySelector('.btn-remove').addEventListener('click', () => { row.remove(); updateLevelRolesEmpty(); });
        container.appendChild(row);
    });
}
function updateLevelRolesEmpty() {
    const container = document.getElementById('level-roles-list');
    if (!container.children.length) container.innerHTML = '<div class="reward-empty">No rewards configured.</div>';
}
function collectLevelRoles() {
    return Array.from(document.querySelectorAll('#level-roles-list .reward-row')).map(row => ({
        level: parseInt(row.querySelector('.lr-level').value) || 1,
        role_id: row.querySelector('.lr-role').value
    }));
}
document.getElementById('btn-add-level-role')?.addEventListener('click', () => {
    const container = document.getElementById('level-roles-list');
    const empty = container.querySelector('.reward-empty');
    if (empty) empty.remove();
    const row = document.createElement('div');
    row.className = 'reward-row';
    row.innerHTML = `
        <input type="number" class="lr-level" value="1" min="1" max="200">
        <select class="lr-role">${globalRoles.map(r => `<option value="${r.id}">@ ${r.name}</option>`).join('')}</select>
        <button type="button" class="btn-remove">Remove</button>
    `;
    row.querySelector('.btn-remove').addEventListener('click', () => { row.remove(); updateLevelRolesEmpty(); });
    container.appendChild(row);
});

// ─── Stat Roles ──────────────────────────────────────────────────────────────
function renderStatRoles(type, roles) {
    const container = document.getElementById(`stat-${type}-roles-list`);
    const countEl = document.getElementById(`stat-${type}-count`);
    if (countEl) countEl.textContent = roles.length;
    if (!roles.length) {
        container.innerHTML = '<div class="reward-empty">No rewards configured.</div>';
        return;
    }
    container.innerHTML = '';
    roles.forEach((r, i) => {
        const row = document.createElement('div');
        row.className = 'reward-row';
        row.innerHTML = `
            <input type="number" class="sr-count" value="${r.count || 1}" min="1">
            <select class="sr-role">${globalRoles.map(gr => `<option value="${gr.id}" ${gr.id == r.role_id ? 'selected' : ''}>@ ${gr.name}</option>`).join('')}</select>
            <button type="button" class="btn-remove">Remove</button>
        `;
        row.querySelector('.btn-remove').addEventListener('click', () => { row.remove(); updateStatRolesEmpty(type); });
        container.appendChild(row);
    });
}
function updateStatRolesEmpty(type) {
    const container = document.getElementById(`stat-${type}-roles-list`);
    const countEl = document.getElementById(`stat-${type}-count`);
    const count = container.querySelectorAll('.reward-row').length;
    if (countEl) countEl.textContent = count;
    if (!count) container.innerHTML = '<div class="reward-empty">No rewards configured.</div>';
}
function collectStatRoles(type) {
    return Array.from(document.querySelectorAll(`#stat-${type}-roles-list .reward-row`)).map(row => ({
        count: parseInt(row.querySelector('.sr-count').value) || 1,
        role_id: row.querySelector('.sr-role').value
    }));
}
document.querySelectorAll('.btn-add-stat-role').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.statType;
        const container = document.getElementById(`stat-${type}-roles-list`);
        if (container.querySelectorAll('.reward-row').length >= 5) return;
        const empty = container.querySelector('.reward-empty');
        if (empty) empty.remove();
        const row = document.createElement('div');
        row.className = 'reward-row';
        row.innerHTML = `
            <input type="number" class="sr-count" value="100" min="1">
            <select class="sr-role">${globalRoles.map(r => `<option value="${r.id}">@ ${r.name}</option>`).join('')}</select>
            <button type="button" class="btn-remove">Remove</button>
        `;
        row.querySelector('.btn-remove').addEventListener('click', () => { row.remove(); updateStatRolesEmpty(type); });
        container.appendChild(row);
        updateStatRolesEmpty(type);
    });
});

// ─── Boosters ────────────────────────────────────────────────────────────────
function renderBoosters(type, boosters) {
    const container = document.getElementById(`${type}-boosters-list`);
    const countEl = document.getElementById(`${type}-booster-count`);
    if (countEl) countEl.textContent = boosters.length;
    if (!boosters.length) {
        container.innerHTML = '<div class="reward-empty">No boosters configured.</div>';
        return;
    }
    container.innerHTML = '';
    const items = type === 'role' ? globalRoles : globalChannels;
    const prefix = type === 'role' ? '@ ' : '# ';
    const idKey = type === 'role' ? 'role_id' : 'channel_id';
    boosters.forEach((b, i) => {
        const row = document.createElement('div');
        row.className = 'reward-row';
        row.innerHTML = `
            <input type="number" class="b-mult" value="${b.multiplier || 2}" min="1" max="10" step="0.5" style="width:70px">
            <select class="b-item">${items.map(it => `<option value="${it.id}" ${it.id == b[idKey] ? 'selected' : ''}>${prefix}${it.name}</option>`).join('')}</select>
            <button type="button" class="btn-remove">Remove</button>
        `;
        row.querySelector('.btn-remove').addEventListener('click', () => { row.remove(); updateBoostersEmpty(type); });
        container.appendChild(row);
    });
}
function updateBoostersEmpty(type) {
    const container = document.getElementById(`${type}-boosters-list`);
    const countEl = document.getElementById(`${type}-booster-count`);
    const count = container.querySelectorAll('.reward-row').length;
    if (countEl) countEl.textContent = count;
    if (!count) container.innerHTML = '<div class="reward-empty">No boosters configured.</div>';
}
function collectBoosters(type) {
    const idKey = type === 'role' ? 'role_id' : 'channel_id';
    return Array.from(document.querySelectorAll(`#${type}-boosters-list .reward-row`)).map(row => ({
        multiplier: parseFloat(row.querySelector('.b-mult').value) || 2,
        [idKey]: row.querySelector('.b-item').value
    }));
}
document.getElementById('btn-add-role-booster')?.addEventListener('click', () => {
    const container = document.getElementById('role-boosters-list');
    if (container.querySelectorAll('.reward-row').length >= 10) return;
    const empty = container.querySelector('.reward-empty');
    if (empty) empty.remove();
    const row = document.createElement('div');
    row.className = 'reward-row';
    row.innerHTML = `
        <input type="number" class="b-mult" value="2" min="1" max="10" step="0.5" style="width:70px">
        <select class="b-item">${globalRoles.map(r => `<option value="${r.id}">@ ${r.name}</option>`).join('')}</select>
        <button type="button" class="btn-remove">Remove</button>
    `;
    row.querySelector('.btn-remove').addEventListener('click', () => { row.remove(); updateBoostersEmpty('role'); });
    container.appendChild(row);
    updateBoostersEmpty('role');
});
document.getElementById('btn-add-channel-booster')?.addEventListener('click', () => {
    const container = document.getElementById('channel-boosters-list');
    if (container.querySelectorAll('.reward-row').length >= 10) return;
    const empty = container.querySelector('.reward-empty');
    if (empty) empty.remove();
    const row = document.createElement('div');
    row.className = 'reward-row';
    row.innerHTML = `
        <input type="number" class="b-mult" value="2" min="1" max="10" step="0.5" style="width:70px">
        <select class="b-item">${globalChannels.map(c => `<option value="${c.id}"># ${c.name}</option>`).join('')}</select>
        <button type="button" class="btn-remove">Remove</button>
    `;
    row.querySelector('.btn-remove').addEventListener('click', () => { row.remove(); updateBoostersEmpty('channel'); });
    container.appendChild(row);
    updateBoostersEmpty('channel');
});



let hasUnsavedChanges = false;
const unsavedBar = document.getElementById('unsaved-bar');
const btnCancelChanges = document.getElementById('btn-cancel-changes');

const changedInputs = new Set();
window.manualDirty = false;

function setDirty(dirty) {
    if (hasUnsavedChanges === dirty) return;
    hasUnsavedChanges = dirty;
    const unsavedBar = document.getElementById('unsaved-bar');
    if (unsavedBar) {
        if (dirty) {
            unsavedBar.style.display = 'flex';
            unsavedBar.style.animation = 'slideUpFade 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
        } else {
            unsavedBar.style.animation = 'slideDownFade 0.3s ease-in forwards';
            setTimeout(() => {
                if (!hasUnsavedChanges) unsavedBar.style.display = 'none';
            }, 300);
        }
    }
}

window.clearDirtyTracking = function() {
    changedInputs.clear();
    window.manualDirty = false;
    setDirty(false);
};

function handleInputChange(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        if (e.target.id === 'chart_days_select') return;
        
        let currentVal = e.target.type === 'checkbox' ? String(e.target.checked) : String(e.target.value);
        if (e.target.dataset.initial !== undefined) {
            if (currentVal !== e.target.dataset.initial) {
                changedInputs.add(e.target);
            } else {
                changedInputs.delete(e.target);
            }
        } else {
            changedInputs.add(e.target);
        }
        
        setDirty(changedInputs.size > 0 || window.manualDirty);
    }
}

// Track inputs
document.addEventListener('input', handleInputChange);
document.addEventListener('change', handleInputChange);

document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-add-ticket-option') || 
        e.target.closest('#btn-add-file-channel') ||
        e.target.closest('#btn-add-auto-reaction') ||
        e.target.closest('#btn-add-hub') ||
        e.target.closest('#btn-add-autoreply') ||
        e.target.closest('.ar-remove-btn') ||
        e.target.closest('.fc-remove-btn') ||
        e.target.closest('.to-remove-btn') ||
        e.target.closest('.tv-remove-btn') ||
        e.target.closest('.add-role-btn') ||
        e.target.closest('.remove-role-btn') ||
        e.target.closest('.add-booster-btn') ||
        e.target.closest('.remove-booster-btn')) {
        window.manualDirty = true;
        setDirty(true);
    }
});

if (btnCancelChanges) {
    btnCancelChanges.addEventListener('click', () => {
        window.clearDirtyTracking();
        // Reload config to revert changes but keep current tab
        if (currentGuildId) loadConfig(currentGuildId, undefined, undefined, true);
    });
}

// --- NEW EMBED BUILDER LOGIC ---

window.promptUrl = function(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;
    const url = prompt("Enter Image URL (HTTPS only):", el.value);
    if (url !== null) {
        el.value = url;
        updateEmbedPreview();
        setDirty(true);
    }
}

function renderEmbedFields() {
    const container = document.getElementById('embed-fields-container');
    if (!container) return;
    container.innerHTML = '';
    embedFields.forEach((field, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'border: 1px solid #313338; border-radius: 4px; padding: 12px; display: flex; flex-direction: column; gap: 8px;';
        
        // Inline icon logic
        const inlineBg = field.inline ? '#006CE7' : '#3B82F6';
        const inlineBorder = field.inline ? 'none' : 'none';
        const inlineColor = field.inline ? 'white' : 'white';

        div.innerHTML = `
            <div style="display: flex; gap: 8px; align-items: center;">
                <div style="flex: 1; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 6px 12px; display: flex; align-items: center; justify-content: space-between;">
                    <input type="text" placeholder="Feldname" value="${field.name}" oninput="updateEmbedField(${index}, 'name', this.value); updateCount(this, 256);" style="background: transparent; border: none; color: #DBDEE1; flex: 1; padding: 0; font-size: 13px;">
                    <span style="font-size: 11px; color: var(--text-muted);">${field.name.length}/256</span>
                </div>
                
                <button type="button" class="btn" title="Toggle Inline" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: ${inlineBg}; border: ${inlineBorder}; color: ${inlineColor}; border-radius: 4px;" onclick="updateEmbedField(${index}, 'inline', !${field.inline})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line></svg>
                </button>
                
                <button type="button" class="btn" title="Edit Properties" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; background: #4B4D54; border: none; color: white; border-radius: 4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
                
                <button type="button" class="btn-danger" title="Delete Field" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 4px; background: #EF4444; border: none; color: white;" onclick="removeEmbedField(${index})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
            
            <div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 8px 12px; position: relative;">
                <textarea rows="2" placeholder="Feldwert" style="background: transparent; border: none; color: #DBDEE1; width: 100%; padding: 0; resize: none; font-size: 13px;" oninput="updateEmbedField(${index}, 'value', this.value); updateCount(this, 1024);">${field.value}</textarea>
                <div style="text-align: right; font-size: 11px; color: var(--text-muted); position: absolute; bottom: 8px; right: 8px;">${field.value.length}/1024</div>
            </div>
        `;
        container.appendChild(div);
    });
    updateEmbedPreview();
    lucide.createIcons();
}

window.updateCount = function(el, max) {
    const countEl = el.nextElementSibling;
    if (countEl && countEl.tagName === 'DIV' || countEl.tagName === 'SPAN') {
        countEl.textContent = `${el.value.length}/${max}`;
    }
}

// Attach character count updaters
const attachCount = (id, max) => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', () => {
            const countEl = document.getElementById(`${id}_count`);
            if (countEl) countEl.textContent = `${el.value.length}/${max}`;
        });
    }
};
attachCount('embed_content', 2000);
attachCount('embed_author_name', 256);
attachCount('embed_title', 256);
attachCount('embed_description', 4096);
attachCount('embed_footer_text', 2048);


// Components v2 Mode Switch
const modeRadios = document.querySelectorAll('input[name="embed_mode"]');
const compSection = document.getElementById('components-v2-section');
modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'components') {
            compSection.style.display = 'block';
        } else {
            compSection.style.display = 'none';
        }
    });
});

let embedComponents = [];

function renderComponents() {
    const cont = document.getElementById('components-container');
    if (!cont) return;
    cont.innerHTML = '';
    embedComponents.forEach((c, i) => {
        const d = document.createElement('div');
        d.style.cssText = 'background: #4E5058; padding: 4px 12px; border-radius: 4px; display: flex; align-items: center; gap: 8px; color: white; font-size: 14px;';
        d.innerHTML = `
            <span><i data-lucide="link" style="width:14px; height:14px;"></i> ${c.label}</span>
            <i data-lucide="x" style="width:14px; height:14px; cursor: pointer;" onclick="embedComponents.splice(${i}, 1); renderComponents(); updateEmbedPreview(); setDirty(true);"></i>
        `;
        cont.appendChild(d);
    });
    lucide.createIcons();
}

const btnAddComp = document.getElementById('btn-add-component');
if (btnAddComp) {
    btnAddComp.addEventListener('click', () => {
        const label = prompt("Button Label:");
        if (!label) return;
        const url = prompt("Button URL (HTTPS only):");
        if (!url) return;
        embedComponents.push({ label, url, style: 5 }); // 5 is URL button
        renderComponents();
        updateEmbedPreview();
        setDirty(true);
    });
}


// ----------------------------------------------------
// MESSAGES CRUD & UI LOGIC
// ----------------------------------------------------
let customMessages = [];
let currentMessageId = null;

async function loadMessages() {
    if (!currentGuildId) return;
    try {
        const res = await fetch(`/api/messages/${currentGuildId}`);
        if (res.ok) {
            customMessages = await res.json();
            renderMessagesList();
        }
    } catch(e) {
        console.error("Failed to load messages", e);
    }
}

function renderMessagesList() {
    const cont = document.getElementById('messages-container');
    if (!cont) return;
    cont.innerHTML = '';
    const query = (document.getElementById('search-messages-input')?.value || '').toLowerCase();
    
    customMessages.filter(m => (m.name || 'Untitled').toLowerCase().includes(query)).forEach(m => {
        const div = document.createElement('div');
        div.className = 'msg-list-item';
        div.style.width = '280px';
        div.style.height = '60px';
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px;">
                <i data-lucide="message-square" style="width:16px; height:16px; color:#949BA4;"></i>
                <span style="color:#DBDEE1; font-weight:500;">${m.name || 'Untitled'}</span>
            </div>
            <i data-lucide="more-vertical" style="width:16px; height:16px; color:#949BA4;"></i>
        `;
        div.onclick = () => openMessageBuilder(m);
        cont.appendChild(div);
    });
    lucide.createIcons();
}

const searchInput = document.getElementById('search-messages-input');
if (searchInput) searchInput.addEventListener('input', renderMessagesList);

window.openMessageBuilder = function(msg = null) {
    document.getElementById('messages-list-view').style.display = 'none';
    document.getElementById('messages-builder-view').style.display = 'block';
    
    if (msg) {
        currentMessageId = msg.id;
        if (document.getElementById('embed_msg_id')) document.getElementById('embed_msg_id').value = msg.id || '';
        if (document.getElementById('embed_msg_name')) document.getElementById('embed_msg_name').value = msg.name || '';
        if (document.getElementById('embed_channel_id')) document.getElementById('embed_channel_id').value = msg.channel_id || '';
        if (document.getElementById('embed_content')) document.getElementById('embed_content').value = msg.content || '';
        
        const modeRadio = document.querySelector(`input[name="embed_mode"][value="${msg.mode || 'normal'}"]`);
        if (modeRadio) {
            modeRadio.checked = true;
            modeRadio.dispatchEvent(new Event('change'));
        }
        
        if (document.getElementById('embed_author_name')) document.getElementById('embed_author_name').value = msg.author_name || '';
        if (document.getElementById('embed_author_icon')) document.getElementById('embed_author_icon').value = msg.author_icon || '';
        if (document.getElementById('embed_title')) document.getElementById('embed_title').value = msg.title || '';
        if (document.getElementById('embed_description')) document.getElementById('embed_description').value = msg.description || '';
        if (document.getElementById('embed_color')) document.getElementById('embed_color').value = msg.color || '#5865F2';
        if (document.getElementById('embed_image')) document.getElementById('embed_image').value = msg.image || '';
        if (document.getElementById('embed_thumbnail')) document.getElementById('embed_thumbnail').value = msg.thumbnail || '';
        if (document.getElementById('embed_footer_text')) document.getElementById('embed_footer_text').value = msg.footer_text || '';
        if (document.getElementById('embed_footer_icon')) document.getElementById('embed_footer_icon').value = msg.footer_icon || '';
        
        embedFields = msg.fields || [];
        embedComponents = msg.components || [];
    } else {
        currentMessageId = null;
        if (document.getElementById('embed_msg_id')) document.getElementById('embed_msg_id').value = '';
        if (document.getElementById('embed_msg_name')) document.getElementById('embed_msg_name').value = 'new embed';
        if (document.getElementById('embed_channel_id')) document.getElementById('embed_channel_id').value = '';
        if (document.getElementById('embed_content')) document.getElementById('embed_content').value = '';
        if (document.getElementById('embed_author_name')) document.getElementById('embed_author_name').value = '';
        if (document.getElementById('embed_author_icon')) document.getElementById('embed_author_icon').value = '';
        if (document.getElementById('embed_title')) document.getElementById('embed_title').value = '';
        if (document.getElementById('embed_description')) document.getElementById('embed_description').value = '';
        if (document.getElementById('embed_image')) document.getElementById('embed_image').value = '';
        if (document.getElementById('embed_thumbnail')) document.getElementById('embed_thumbnail').value = '';
        if (document.getElementById('embed_footer_text')) document.getElementById('embed_footer_text').value = '';
        if (document.getElementById('embed_footer_icon')) document.getElementById('embed_footer_icon').value = '';
        embedFields = [];
        embedComponents = [];
        
        const modeRadio = document.querySelector(`input[name="embed_mode"][value="normal"]`);
        if (modeRadio) {
            modeRadio.checked = true;
            modeRadio.dispatchEvent(new Event('change'));
        }
    }
    
    renderEmbedFields();
    renderComponents();
    updateEmbedPreview();
    updateDropBackgrounds();
    
    // Show/hide Delete button based on whether editing existing message
    const delBtn = document.getElementById('btn-embed-delete');
    if (delBtn) delBtn.style.display = msg ? 'inline-block' : 'none';
    
    // Clear any pending uploads from previous session
    window.pendingMessageUploads = {};
    
    // Dispatch input events to trigger char counts
    ['embed_content', 'embed_author_name', 'embed_title', 'embed_description', 'embed_footer_text'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.dispatchEvent(new Event('input'));
    });
    
    setDirty(false);
}

window.closeMessageBuilder = function() {
    if (hasUnsavedChanges) {
        if (!confirm("You have unsaved changes. Discard?")) return;
    }
    document.getElementById('messages-list-view').style.display = 'block';
    document.getElementById('messages-builder-view').style.display = 'none';
    setDirty(false);
}

// ----------------------------------------------------
// DRAG AND DROP IMAGE UPLOADS
// ----------------------------------------------------
function updateDropBackgrounds() {
    const bgs = [
        { dropId: 'drop-author-icon', inputId: 'embed_author_icon' },
        { dropId: 'drop-thumbnail', inputId: 'embed_thumbnail' },
        { dropId: 'drop-image', inputId: 'embed_image' },
        { dropId: 'drop-footer-icon', inputId: 'embed_footer_icon' }
    ];
    bgs.forEach(b => {
        const drop = document.getElementById(b.dropId);
        const inp = document.getElementById(b.inputId);
        if (drop && inp) {
            const svg = drop.querySelector('svg');
            if (inp.value) {
                drop.style.backgroundImage = `url(${inp.value})`;
                if (svg) svg.style.display = 'none';
            } else {
                drop.style.backgroundImage = 'none';
                if (svg) svg.style.display = 'block';
            }
        }
    });
}

const fileInput = document.getElementById('file-upload-input');
let currentUploadTarget = null;

window.pendingMessageUploads = {};

async function uploadFile(file, targetInputId) {
    if (!file) return;
    
    // Defer the upload until save
    window.pendingMessageUploads[targetInputId] = file;
    const blobUrl = URL.createObjectURL(file);
    document.getElementById(targetInputId).value = blobUrl;
    
    updateDropBackgrounds();
    updateEmbedPreview();
    setDirty(true);
    showToast("Image added (will upload on save)");
}

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0 && currentUploadTarget) {
            uploadFile(e.target.files[0], currentUploadTarget);
        }
        e.target.value = '';
    });
}

function setupDropZone(dropId, inputId) {
    const drop = document.getElementById(dropId);
    if (!drop) return;
    
    drop.addEventListener('click', () => {
        // Just trigger file input
        currentUploadTarget = inputId;
        fileInput.click();
    });
    
    drop.addEventListener('dragover', (e) => {
        e.preventDefault();
        drop.style.borderColor = '#006CE7';
    });
    
    drop.addEventListener('dragleave', () => {
        drop.style.borderColor = '#4E5058';
    });
    
    drop.addEventListener('drop', (e) => {
        e.preventDefault();
        drop.style.borderColor = '#4E5058';
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            uploadFile(e.dataTransfer.files[0], inputId);
        }
    });
}

setupDropZone('drop-author-icon', 'embed_author_icon');
setupDropZone('drop-thumbnail', 'embed_thumbnail');
setupDropZone('drop-image', 'embed_image');
setupDropZone('drop-footer-icon', 'embed_footer_icon');

// Replace the old promptUrl logic
window.promptUrl = function(inputId) {
    // Legacy mapping (just in case)
    currentUploadTarget = inputId;
    fileInput.click();
}

// ----------------------------------------------------
// SAVE AND DELETE MESSAGE LOGIC
// ----------------------------------------------------
window.saveCurrentCustomMessage = async function() {
    if (!currentGuildId) return;
    
    let mode = 'normal';
    const modeRadio = document.querySelector('input[name="embed_mode"]:checked');
    if (modeRadio) mode = modeRadio.value;
    
    let msgNameElement = document.getElementById('embed_msg_name');
    let msgName = msgNameElement ? msgNameElement.value.trim() : "New Message";
    if (!msgName) {
        showToast("Please provide a name for this message.");
        return;
    }
    
    showToast("Processing uploads...");
    
    // Process pending uploads
    const uploadTargets = Object.keys(window.pendingMessageUploads);
    for (let targetId of uploadTargets) {
        const file = window.pendingMessageUploads[targetId];
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch(`/api/upload/image`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success && data.url) {
                document.getElementById(targetId).value = data.url;
            } else {
                showToast("Upload failed for one image, continuing anyway.");
            }
        } catch(e) {
            console.error("Upload failed", e);
        }
    }
    // Clear pending
    window.pendingMessageUploads = {};
    
    const payload = {
        id: currentMessageId,
        name: msgName,
        channel_id: document.getElementById('embed_channel_id') ? document.getElementById('embed_channel_id').value : '',
        mode: mode,
        content: document.getElementById('embed_content') ? document.getElementById('embed_content').value : '',
        author_name: document.getElementById('embed_author_name') ? document.getElementById('embed_author_name').value : '',
        author_icon: document.getElementById('embed_author_icon') ? document.getElementById('embed_author_icon').value : '',
        title: document.getElementById('embed_title') ? document.getElementById('embed_title').value : '',
        description: document.getElementById('embed_description') ? document.getElementById('embed_description').value : '',
        color: document.getElementById('embed_color') ? document.getElementById('embed_color').value : '#5865F2',
        image: document.getElementById('embed_image') ? document.getElementById('embed_image').value : '',
        thumbnail: document.getElementById('embed_thumbnail') ? document.getElementById('embed_thumbnail').value : '',
        footer_text: document.getElementById('embed_footer_text') ? document.getElementById('embed_footer_text').value : '',
        footer_icon: document.getElementById('embed_footer_icon') ? document.getElementById('embed_footer_icon').value : '',
        fields: embedFields,
        components: mode === 'components' ? embedComponents : []
    };
    
    try {
        const res = await fetch(`/api/messages/${currentGuildId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            showToast("Message saved!");
            currentMessageId = data.id;
            setDirty(false);
            await loadMessages();
        } else {
            showToast("Error: " + data.error);
        }
    } catch(e) {
        showToast("Failed to save.");
    }
};

const btnDeleteMsg = document.getElementById('btn-embed-delete');
if (btnDeleteMsg) {
    btnDeleteMsg.addEventListener('click', async () => {
        if (!currentMessageId || !currentGuildId) {
            showToast("This message hasn't been saved yet.");
            return;
        }
        if (!confirm("Are you sure you want to delete this message?")) return;
        
        btnDeleteMsg.disabled = true;
        try {
            const res = await fetch(`/api/messages/${currentGuildId}/${currentMessageId}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                showToast("Message deleted!");
                await loadMessages();
                closeMessageBuilder();
            } else {
                showToast("Error: " + data.error);
            }
        } catch(e) {
            showToast("Failed to delete.");
        }
        btnDeleteMsg.disabled = false;
    });
}

const btnSaveMsg = document.getElementById('btn-embed-save');
if (btnSaveMsg) {
    btnSaveMsg.addEventListener('click', async () => {
        btnSaveMsg.disabled = true;
        btnSaveMsg.textContent = 'Saving...';
        try {
            await window.saveCurrentCustomMessage();
        } catch(e) {
            console.error(e);
        }
        btnSaveMsg.disabled = false;
        btnSaveMsg.textContent = 'Save Message';
    });
}

// ----------------------------------------------------
// OLD LOGIC HOOKUPS
// ----------------------------------------------------
let embedFields = [];

window.addEmbedField = function() {
    if (embedFields.length >= 25) return showToast('Maximum 25 fields allowed');
    embedFields.push({ name: '', value: '', inline: false });
    renderEmbedFields();
    setDirty(true);
}

window.removeEmbedField = function(index) {
    embedFields.splice(index, 1);
    renderEmbedFields();
    setDirty(true);
}

window.updateEmbedField = function(index, key, value) {
    embedFields[index][key] = value;
    updateEmbedPreview();
    setDirty(true);
}

function updateEmbedPreview() {
    if (!document.getElementById('section-messages')) return;
    
    const content = document.getElementById('embed_content')?.value || '';
    const authorName = document.getElementById('embed_author_name')?.value || '';
    const authorIcon = document.getElementById('embed_author_icon')?.value || '';
    const title = document.getElementById('embed_title')?.value || '';
    const desc = document.getElementById('embed_description')?.value || '';
    const color = document.getElementById('embed_color')?.value || '#5865F2';
    const image = document.getElementById('embed_image')?.value || '';
    const thumbnail = document.getElementById('embed_thumbnail')?.value || '';
    const footerText = document.getElementById('embed_footer_text')?.value || '';
    const footerIcon = document.getElementById('embed_footer_icon')?.value || '';
    
    document.getElementById('preview-content').textContent = content;
    document.getElementById('preview-content').style.display = content ? 'block' : 'none';
    
    const modeRadio = document.querySelector('input[name="embed_mode"]:checked');
    const mode = modeRadio ? modeRadio.value : 'normal';
    
    const embedEl = document.getElementById('preview-embed');
    const v2El = document.getElementById('preview-v2-container');
    
    if (mode === 'components') {
        embedEl.style.display = 'none';
        let hasV2 = title || desc || embedFields.length > 0;
        
        if (hasV2) {
            v2El.style.display = 'block';
            
            const v2Title = document.getElementById('preview-v2-title');
            if (title) { v2Title.style.display = 'block'; v2Title.textContent = title; } else { v2Title.style.display = 'none'; }
            
            const v2Desc = document.getElementById('preview-v2-description');
            if (desc) { v2Desc.style.display = 'block'; v2Desc.textContent = desc; } else { v2Desc.style.display = 'none'; }
            
            const v2Div = document.getElementById('preview-v2-divider');
            if (title && (desc || embedFields.length > 0)) { v2Div.style.display = 'block'; } else { v2Div.style.display = 'none'; }
            
            const v2Fields = document.getElementById('preview-v2-fields');
            v2Fields.innerHTML = '';
            if (embedFields.length > 0) {
                v2Fields.style.display = 'flex';
                if (!title && !desc) v2Div.style.display = 'none';
                else if (title) v2Div.style.display = 'block';
                
                embedFields.forEach(f => {
                    const fd = document.createElement('div');
                    fd.innerHTML = `<div style="color: #F2F3F5; font-size: 14px; font-weight: 600; margin-bottom: 2px;">${f.name || '​'}</div><div style="color: #DBDEE1; font-size: 14px; white-space: pre-wrap;">${f.value || '​'}</div>`;
                    v2Fields.appendChild(fd);
                });
            } else { v2Fields.style.display = 'none'; }
            
        } else {
            v2El.style.display = 'none';
        }
    } else {
        v2El.style.display = 'none';
        let hasEmbed = authorName || title || desc || image || thumbnail || footerText || embedFields.length > 0;
        
        if (hasEmbed) {
            embedEl.style.display = 'block';
            embedEl.style.borderLeftColor = color;
            
            const authorEl = document.getElementById('preview-author');
            if (authorName) {
                authorEl.style.display = 'flex';
                document.getElementById('preview-author-name').textContent = authorName;
                const aIcon = document.getElementById('preview-author-icon');
                if (authorIcon) { aIcon.src = authorIcon; aIcon.style.display = 'block'; }
                else { aIcon.style.display = 'none'; }
            } else { authorEl.style.display = 'none'; }
            
            const titleEl = document.getElementById('preview-title');
            if (title) { titleEl.style.display = 'block'; titleEl.textContent = title; } else { titleEl.style.display = 'none'; }
            
            const descEl = document.getElementById('preview-description');
            if (desc) { descEl.style.display = 'block'; descEl.textContent = desc; } else { descEl.style.display = 'none'; }
            
            const imageEl = document.getElementById('preview-image');
            if (image) { imageEl.style.display = 'block'; imageEl.src = image; } else { imageEl.style.display = 'none'; }
            
            const thumbCont = document.getElementById('preview-thumbnail-container');
            if (thumbnail) { thumbCont.style.display = 'block'; document.getElementById('preview-thumbnail').src = thumbnail; } else { thumbCont.style.display = 'none'; }
            
            const footerEl = document.getElementById('preview-footer');
            if (footerText) {
                footerEl.style.display = 'flex';
                document.getElementById('preview-footer-text').textContent = footerText;
                const fIcon = document.getElementById('preview-footer-icon');
                if (footerIcon) { fIcon.src = footerIcon; fIcon.style.display = 'block'; }
                else { fIcon.style.display = 'none'; }
            } else { footerEl.style.display = 'none'; }
            
            const fieldsCont = document.getElementById('preview-fields');
            fieldsCont.innerHTML = '';
            if (embedFields.length > 0) {
                fieldsCont.style.display = 'flex';
                embedFields.forEach(f => {
                    const fd = document.createElement('div');
                    fd.style.minWidth = f.inline ? '30%' : '100%';
                    fd.style.flex = f.inline ? '1' : '0 0 100%';
                    fd.className = 'embed-field-preview';
                    fd.innerHTML = `<div style="color: #F2F3F5; font-size: 14px; font-weight: 600; margin-bottom: 2px;">${f.name || '​'}</div><div style="color: #DBDEE1; font-size: 14px; white-space: pre-wrap;">${f.value || '​'}</div>`;
                    fieldsCont.appendChild(fd);
                });
            } else { fieldsCont.style.display = 'none'; }
        } else { embedEl.style.display = 'none'; }
    }
    
    // Render Components (Buttons) below the embed/v2 UI
    const compCont = document.getElementById('preview-components-container');
    if (compCont) {
        compCont.innerHTML = '';
        if (mode === 'components' && embedComponents && embedComponents.length > 0) {
            compCont.style.display = 'flex';
            embedComponents.forEach(c => {
                const b = document.createElement('div');
                b.style.cssText = 'background: #4E5058; padding: 6px 16px; border-radius: 4px; display: inline-flex; align-items: center; gap: 8px; color: white; font-size: 14px; font-weight: 500; cursor: default;';
                b.innerHTML = `<i data-lucide="link" style="width:16px; height:16px;"></i> ${c.label}`;
                compCont.appendChild(b);
            });
            lucide.createIcons();
        } else {
            compCont.style.display = 'none';
        }
    }
}

const embedInputs = ['embed_content', 'embed_author_name', 'embed_title', 'embed_description', 'embed_footer_text'];
embedInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateEmbedPreview);
});

document.querySelectorAll('input[name="embed_mode"]').forEach(radio => {
    radio.addEventListener('change', updateEmbedPreview);
});

const btnAddField = document.getElementById('btn-add-embed-field');
if (btnAddField) btnAddField.addEventListener('click', window.addEmbedField);

const btnSendEmbed = document.getElementById('btn-embed-send');
if (btnSendEmbed) {
    btnSendEmbed.addEventListener('click', async () => {
        const channelId = document.getElementById('embed_channel_id').value;
        if (!channelId) return showToast("Please select a destination channel");
        
        let mode = 'normal';
        const modeRadio = document.querySelector('input[name="embed_mode"]:checked');
        if (modeRadio) mode = modeRadio.value;

        const payload = {
            channel_id: channelId,
            content: document.getElementById('embed_content') ? document.getElementById('embed_content').value : '',
            author_name: document.getElementById('embed_author_name') ? document.getElementById('embed_author_name').value : '',
            author_icon: document.getElementById('embed_author_icon') ? document.getElementById('embed_author_icon').value : '',
            title: document.getElementById('embed_title') ? document.getElementById('embed_title').value : '',
            url: document.getElementById('embed_url') ? document.getElementById('embed_url').value : '',
            description: document.getElementById('embed_description') ? document.getElementById('embed_description').value : '',
            color: document.getElementById('embed_color') ? document.getElementById('embed_color').value : '#5865F2',
            image: document.getElementById('embed_image') ? document.getElementById('embed_image').value : '',
            thumbnail: document.getElementById('embed_thumbnail') ? document.getElementById('embed_thumbnail').value : '',
            footer_text: document.getElementById('embed_footer_text') ? document.getElementById('embed_footer_text').value : '',
            footer_icon: document.getElementById('embed_footer_icon') ? document.getElementById('embed_footer_icon').value : '',
            fields: embedFields,
            components: mode === 'components' ? embedComponents : [],
            mode: mode
        };
        
        // Upload any pending images before sending
        const pendingKeys = Object.keys(window.pendingMessageUploads);
        if (pendingKeys.length > 0) {
            showToast("Uploading images...");
            for (let targetId of pendingKeys) {
                const file = window.pendingMessageUploads[targetId];
                const formData = new FormData();
                formData.append('file', file);
                try {
                    const upRes = await fetch(`/api/upload/image`, { method: 'POST', body: formData });
                    const upData = await upRes.json();
                    if (upData.success && upData.url) {
                        document.getElementById(targetId).value = upData.url;
                        // Update the payload field that corresponds to this input
                        const fieldMap = { 'embed_author_icon': 'author_icon', 'embed_thumbnail': 'thumbnail', 'embed_image': 'image', 'embed_footer_icon': 'footer_icon' };
                        if (fieldMap[targetId]) payload[fieldMap[targetId]] = upData.url;
                    }
                } catch(e) { console.error("Upload failed", e); }
            }
            window.pendingMessageUploads = {};
        }
        
        btnSendEmbed.disabled = true;
        btnSendEmbed.textContent = 'Sending...';
        
        try {
            const res = await fetch(`/api/action/${currentGuildId}/send_embed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const text = await res.text();
            if (res.ok) {
                showToast("Message sent successfully!");
            } else {
                let err = text;
                try { err = JSON.parse(text).error || text; } catch(e){}
                showToast("Error: " + err);
            }
        } catch (e) {
            showToast("Failed to send message.");
        }
        
        btnSendEmbed.disabled = false;
        btnSendEmbed.textContent = 'Send Message';
    });
}

// ==========================================
// CHARTS (Chart.js) & STATS
// ==========================================
let chartsInitialized = false;
let chartJoins, chartFlow, chartMessages;

const customTooltip = (context) => {
    let tooltipEl = document.getElementById('chartjs-tooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        tooltipEl.style.background = '#FFFFFF';
        tooltipEl.style.borderRadius = '4px';
        tooltipEl.style.color = '#313338';
        tooltipEl.style.opacity = 1;
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.transform = 'translate(-50%, 0)';
        tooltipEl.style.transition = 'all .1s ease';
        tooltipEl.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        tooltipEl.style.padding = '8px 12px';
        tooltipEl.style.minWidth = '100px';
        tooltipEl.style.zIndex = 1000;
        document.body.appendChild(tooltipEl);
    }

    const tooltipModel = context.tooltip;
    if (tooltipModel.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
    }

    if (tooltipModel.body) {
        const titleLines = tooltipModel.title || [];
        let innerHtml = '<div style="margin-bottom: 6px; font-weight: 500;">' + titleLines[0] + '</div>';

        tooltipModel.dataPoints.forEach(function(dataPoint) {
            const dataset = context.chart.data.datasets[dataPoint.datasetIndex];
            const color = dataset.borderColor;
            const label = dataset.label.toLowerCase();
            const value = dataPoint.raw;
            innerHtml += `<div style="color: ${color}; margin-top: 4px;">${label} : ${value}</div>`;
        });
        tooltipEl.innerHTML = innerHtml;
    }

    const position = context.chart.canvas.getBoundingClientRect();
    tooltipEl.style.opacity = 1;
    tooltipEl.style.left = position.left + window.scrollX + tooltipModel.caretX + 'px';
    tooltipEl.style.top = position.top + window.scrollY + tooltipModel.caretY - tooltipEl.offsetHeight - 15 + 'px';
};

const verticalLinePlugin = {
    id: 'verticalLine',
    afterDraw: chart => {
        if (chart.tooltip?._active?.length) {
            let x = chart.tooltip._active[0].element.x;
            let yAxis = chart.scales.y;
            let ctx = chart.ctx;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, yAxis.top);
            ctx.lineTo(x, yAxis.bottom);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#DBDEE1';
            ctx.stroke();
            ctx.restore();
        }
    }
};

const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    plugins: {
        legend: { display: false },
        tooltip: {
            enabled: false,
            external: customTooltip
        },
        verticalLine: true
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: { color: '#313338' },
            ticks: { stepSize: 1, precision: 0 }
        },
        x: {
            grid: { display: false }
        }
    }
};

Chart.register(verticalLinePlugin);

function initCharts() {
    if (chartsInitialized) return;
    chartsInitialized = true;
    
    Chart.defaults.color = '#DBDEE1';
    Chart.defaults.font.family = "'gg sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";
    
    const ctxJoins = document.getElementById('chart-joins');
    if (ctxJoins) {
        chartJoins = new Chart(ctxJoins, {
            type: 'line',
            data: { labels: [], datasets: [
                { label: 'Joins', data: [], borderColor: '#23A559', backgroundColor: 'rgba(35, 165, 89, 0.1)', fill: true, tension: 0.4 },
                { label: 'Leaves', data: [], borderColor: '#DA373C', backgroundColor: 'rgba(218, 55, 60, 0.1)', fill: true, tension: 0.4 }
            ]},
            options: commonChartOptions
        });
    }

    const ctxFlow = document.getElementById('chart-flow');
    if (ctxFlow) {
        chartFlow = new Chart(ctxFlow, {
            type: 'line',
            data: { labels: [], datasets: [
                { label: 'Flow', data: [], borderColor: '#5865F2', backgroundColor: 'rgba(88, 101, 242, 0.1)', fill: true, tension: 0.4 }
            ]},
            options: commonChartOptions
        });
    }

    const ctxMessages = document.getElementById('chart-messages');
    if (ctxMessages) {
        chartMessages = new Chart(ctxMessages, {
            type: 'line',
            data: { labels: [], datasets: [
                { label: 'Messages', data: [], borderColor: '#F47FFF', backgroundColor: 'rgba(244, 127, 255, 0.1)', fill: true, tension: 0.4 }
            ]},
            options: commonChartOptions
        });
    }

    const daysSelect = document.getElementById('chart_days_select');
    if (daysSelect) {
        daysSelect.addEventListener('change', (e) => {
            fetchAndRenderStats(e.target.value);
        });
    }

    fetchAndRenderStats(7);
}

async function fetchAndRenderStats(days) {
    if (!currentGuildId) return;
    try {
        const res = await fetch(`/api/guild_stats/${currentGuildId}?days=${days}`);
        const data = await res.json();
        if (data.error) return;

        const elNewMessages = document.getElementById('stat_new_messages');
        const elJoinsLeaves = document.getElementById('stat_joins_leaves');
        const elTotalMembers = document.getElementById('stat_total_members');

        if (elNewMessages) elNewMessages.textContent = data.today_messages || 0;
        if (elJoinsLeaves) elJoinsLeaves.textContent = `${data.today_joins || 0}/${data.today_leaves || 0}`;
        if (elTotalMembers) elTotalMembers.textContent = data.total_members || 0;

        if (!data.history) return;
        const labels = data.history.map(d => d.date);
        const joins = data.history.map(d => d.joins);
        const leaves = data.history.map(d => d.leaves);
        const flow = data.history.map(d => d.joins - d.leaves);
        const msgs = data.history.map(d => d.messages);

        if (chartJoins) {
            chartJoins.data.labels = labels;
            chartJoins.data.datasets[0].data = joins;
            chartJoins.data.datasets[1].data = leaves;
            chartJoins.update();
        }
        if (chartFlow) {
            chartFlow.data.labels = labels;
            chartFlow.data.datasets[0].data = flow;
            chartFlow.update();
        }
        if (chartMessages) {
            chartMessages.data.labels = labels;
            chartMessages.data.datasets[0].data = msgs;
            chartMessages.update();
        }
    } catch (e) {
        console.error("Failed to fetch stats", e);
    }
}
