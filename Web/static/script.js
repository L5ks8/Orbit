let currentUser = null;
let currentGuildId = null;
let currentAutomodConfig = {};
let activeAutomodRule = null;
let autoresponder = {};
let joinroles = [];

const LOGS_CATEGORIES = [
    { id: "moderation_action", title: "Moderation Action", icon: "shield-alert" },
    { id: "auto_moderation", title: "Auto-Moderation", icon: "bot" },
    { id: "message_deleted", title: "Message Deleted", icon: "trash" },
    { id: "message_edited", title: "Message Edited", icon: "edit-2" },
    { id: "bulk_message_delete", title: "Multiple Messages Deleted", icon: "message-square-dashed" },
    { id: "member_joined", title: "Member Joined", icon: "user-plus" },
    { id: "member_left", title: "Member Left", icon: "user-minus" },
    { id: "member_joined_voice", title: "Joined Voice Channel", icon: "mic" },
    { id: "member_left_voice", title: "Left Voice Channel", icon: "mic-off" },
    { id: "member_moved_voice", title: "Moved Voice Channel", icon: "arrow-right-left" },
    { id: "role_created", title: "Role Created", icon: "plus-circle" },
    { id: "role_deleted", title: "Role Deleted", icon: "minus-circle" },
    { id: "role_updated", title: "Role Updated", icon: "refresh-cw" },
    { id: "channel_created", title: "Channel Created", icon: "hash" },
    { id: "channel_deleted", title: "Channel Deleted", icon: "x-square" },
    { id: "channel_updated", title: "Channel Updated", icon: "edit" },
    { id: "scheduled_event_created", title: "Event Created", icon: "calendar-plus" },
    { id: "scheduled_event_deleted", title: "Event Deleted", icon: "calendar-minus" },
    { id: "scheduled_event_updated", title: "Event Updated", icon: "calendar" },
    { id: "mod_command_used", title: "Mod Command Used", icon: "terminal" }
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
                loadConfig(g.id, g.name);
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
    constructor(selectElement, items, selectedValue, placeholder) {
        this.select = selectElement;
        this.select.style.display = 'none';
        
        this.items = items;
        this.value = selectedValue || '';
        this.placeholder = placeholder || 'Select...';
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
            this.trigger.innerHTML = `<div class="content"><span class="color-dot" style="background:${item.color}"></span> @${item.name}</div> <i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i>`;
        } else {
            this.trigger.innerHTML = `<div class="content" style="color:var(--text-secondary); font-weight:600;">${placeholder}</div> <i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i>`;
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
            opt.innerHTML = `<span class="color-dot" style="background:${item.color}"></span> @${item.name}`;
            opt.addEventListener('click', () => {
                this.value = item.id;
                this.updateTrigger('Select Role...');
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
        <button type="button" class="btn-danger" style="padding: 0 12px; font-size: 16px; flex-shrink:0;" onclick="this.closest('.autoreply-row').remove()">Ãƒâ€”</button>
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

function renderJoinRoles(roles) {
    const list = document.getElementById('joinrole-list');
    list.innerHTML = '';
    if (roles.length === 0) {
        list.innerHTML = '<p style="color:var(--text-secondary); font-size:14px; margin:0;">No join roles configured.</p>';
        return;
    }

    roles.forEach(r => addJoinRoleRow(r));
}

function addJoinRoleRow(roleId = '') {
    const list = document.getElementById('joinrole-list');
    if (list.querySelector('p')) list.innerHTML = '';

    const row = document.createElement('div');
    row.style.cssText = 'display: flex; gap: 10px; align-items: center; background: var(--bg-color); padding: 10px; border-radius: 6px; border: 1px solid var(--border-color);';
    
    const selectContainer = document.createElement('div');
    selectContainer.style.cssText = 'flex: 1;';
    
    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.className = 'btn-danger';
    btnRemove.style.cssText = 'padding: 0 12px; font-size: 16px; height: 38px;';
    btnRemove.innerHTML = '<i data-lucide="x" style="width: 18px; height: 18px;"></i>';
    btnRemove.onclick = () => row.remove();
    lucide.createIcons({ root: btnRemove });

    row.appendChild(selectContainer);
    row.appendChild(btnRemove);
    list.appendChild(row);

    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.className = 'jr-select';
    selectContainer.appendChild(hiddenInput);

    new CustomSelect(hiddenInput, globalRoles, roleId, 'Select Role to Assign...');
}

document.getElementById('btn-add-autoreply').addEventListener('click', () => addAutoReplyRow());
document.getElementById('btn-add-joinrole').addEventListener('click', () => {
    addJoinRoleRow();
});

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

// LOAD CONFIGURATION
async function loadConfig(guildId, guildName) {
    currentGuildId = guildId;
    document.getElementById('config-server-name').innerText = guildName;
    showView('config');
    
    document.getElementById('config-layout').style.display = 'none';
    document.getElementById('config-loader').classList.remove('hidden');

    // Reset tabs to welcome section
    document.querySelectorAll('.dash-nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelectorAll('.dash-panel').forEach(sec => sec.classList.remove('active'));
    document.querySelector('.dash-nav-item[data-target="section-welcome"]').classList.add('active');
    document.getElementById('section-welcome').classList.add('active');

    try {
        const res = await fetch(`/api/config/${guildId}`);
        const data = await res.json();
        globalRoles = data.roles;
        globalCategories = data.categories || [];
        globalChannels = data.channels || [];

        // Populate normal selects (channels)
        const welcomeSelect = document.getElementById('welcome_channel_id');
        welcomeSelect.innerHTML = '<option value="">None</option>';
        const goodbyeSelect = document.getElementById('goodbye_channel_id');
        goodbyeSelect.innerHTML = '<option value="">None</option>';
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
            verifyPanelSelect.innerHTML += `<option value="${c.id}">#${c.name}</option>`;
            ticketPanelSelect.innerHTML += `<option value="${c.id}">#${c.name}</option>`;
            ticketLogSelect.innerHTML += `<option value="${c.id}">#${c.name}</option>`;
        });

        // Set values
        const config = data.config;
        currentPermissions = data.permissions || {};
        
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
        new CustomMultiSelect(amGlobalRoEl, globalRoles, "Select...", (item) => "@ " + item.name);

        // Verify
        if (!currentPermissions.can_roles) lockSection('section-verify', 'Manage Roles');
        document.getElementById('verify_enabled').checked = config.verify?.enabled || false;
        document.getElementById('verify_type').value = config.verify?.verification_type || 'captcha';

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
        
        const logsGlobalChEl = document.getElementById('logs_global_channels');
        if (logsGlobalChEl.nextElementSibling?.classList.contains('custom-multiselect')) logsGlobalChEl.nextElementSibling.remove();
        logsGlobalChEl.innerHTML = "";
        globalChannels.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c.id;
            if (config.logs?.global_exempt_channels?.includes(c.id)) opt.selected = true;
            logsGlobalChEl.appendChild(opt);
        });
        new CustomMultiSelect(logsGlobalChEl, globalChannels, "Select...", (item) => "# " + item.name);

        const logsGlobalRoEl = document.getElementById('logs_global_roles');
        if (logsGlobalRoEl.nextElementSibling?.classList.contains('custom-multiselect')) logsGlobalRoEl.nextElementSibling.remove();
        logsGlobalRoEl.innerHTML = "";
        globalRoles.forEach(r => {
            const opt = document.createElement("option");
            opt.value = r.id;
            if (config.logs?.global_exempt_roles?.includes(r.id)) opt.selected = true;
            logsGlobalRoEl.appendChild(opt);
        });
        new CustomMultiSelect(logsGlobalRoEl, globalRoles, "Select...", (item) => `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${item.color};margin-right:6px;"></span> ${item.name}`);

        LOGS_CATEGORIES.forEach(cat => {
            const isEnabled = config.logs?.categories?.[cat.id] || false;
            const selectedCh = config.logs?.channels?.[cat.id] || '';
            
            let optionsHtml = `<option value="">-- Disabled --</option>`;
            globalChannels.forEach(c => {
                const selected = (c.id === selectedCh) ? 'selected' : '';
                optionsHtml += `<option value="${c.id}" ${selected}>#${c.name}</option>`;
            });

            const checked = isEnabled ? 'checked' : '';

            logsGrid.innerHTML += `
                <div class="am-card">
                    <div class="am-card-header">
                        <div class="am-card-title">
                            <i data-lucide="${cat.icon}" class="am-card-icon"></i>
                            ${cat.title}
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" id="log_cat_${cat.id}_enabled" ${checked}>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="am-card-body">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>Log Channel</label>
                            <select id="log_cat_${cat.id}_channel" style="width:100%; padding:8px; border-radius:4px; background:var(--bg-modifier-hover); color:var(--text-normal); border:1px solid rgba(255,255,255,0.1);">
                                ${optionsHtml}
                            </select>
                        </div>
                    </div>
                </div>
            `;
        });
        lucide.createIcons();

        // Clear existing custom selects
        document.querySelectorAll('.custom-select').forEach(el => el.remove());
        document.querySelectorAll('.custom-multiselect').forEach(el => el.remove());

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
        new CustomMultiSelect(logsRolesEl, globalRoles, "Select...", (item) => "@ " + item.name);

        // AutoResponder & JoinRoles & TicketOptions
        if (!currentPermissions.can_messages) lockSection('section-autoresponder', 'Manage Messages');
        renderAutoReplies(config.autoresponder || {});
        
        if (!currentPermissions.can_roles) lockSection('section-joinroles', 'Manage Roles');
        renderJoinRoles(config.joinroles || []);
        
        renderTicketOptions(config.ticket?.options_slots || []);
        
        // Initial Preview Update
        updateLivePreview();

        document.getElementById('config-loader').classList.add('hidden');
        document.getElementById('config-layout').style.display = 'grid';
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
        .replace(/{user}/g, '<span style="background: rgba(88, 101, 242, 0.3); color: #C9CDFB; padding: 0 2px; border-radius: 3px;">@user</span>')
        .replace(/{server}/g, '<b>Orbit</b>')
        .replace(/{count}/g, '<b>100</b>')
        .replace(/#([\w-]+)/g, '<span style="color: #5865F2; font-weight: 500;">#$1</span>');
        
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
        .replace(/{user}/g, '<span style="background: rgba(88, 101, 242, 0.3); color: #C9CDFB; padding: 0 2px; border-radius: 3px;">@user</span>')
        .replace(/{server}/g, '<b>Orbit</b>')
        .replace(/{count}/g, '<b>100</b>')
        .replace(/#([\w-]+)/g, '<span style="color: #5865F2; font-weight: 500;">#$1</span>');
        
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

document.getElementById('welcome_message').addEventListener('input', updateLivePreview);
document.getElementById('welcome_image_url').addEventListener('input', () => syncDropzoneFromUrl(document.getElementById('welcome_image_url').value));

document.getElementById('goodbye_message').addEventListener('input', updateGoodbyeLivePreview);
document.getElementById('goodbye_image_url').addEventListener('input', () => syncGoodbyeDropzoneFromUrl(document.getElementById('goodbye_image_url').value));

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
        new CustomMultiSelect(document.getElementById('am-modal-roles'), globalRoles, "Select...", (item) => "@ " + item.name);
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
            ruleCfg.words = document.getElementById('am-modal-words').value.split(',').map(s=>s.trim()).filter(s=>s);
        } else if (activeAutomodRule === 'anti_spam') {
            ruleCfg.max_messages = parseInt(document.getElementById('am-modal-msgs').value) || 5;
            ruleCfg.time_window_sec = parseInt(document.getElementById('am-modal-window').value) || 3;
        } else if (activeAutomodRule === 'anti_link') {
            ruleCfg.blocked_domains = document.getElementById('am-modal-domains').value.split(',').map(s=>s.trim()).filter(s=>s);
        } else if (activeAutomodRule === 'mention_spam') {
            ruleCfg.max_mentions = parseInt(document.getElementById('am-modal-mentions').value) || 4;
        } else if (activeAutomodRule === 'anti_alt') {
            ruleCfg.min_age_days = parseInt(document.getElementById('am-modal-age').value) || 3;
            const act = document.getElementById('am-modal-action-alt');
            if(act) ruleCfg.action = act.value;
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

    // Collect JoinRoles Data
    const joinroles = [];
    document.querySelectorAll('.jr-select').forEach(select => {
        const val = select.value;
        if (val) joinroles.push(val);
    });

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

    // Collect AutoMod Toggle States and Global Exepts
    currentAutomodConfig.enabled = document.getElementById('automod_enabled').checked;
    
    if(!currentAutomodConfig.banned_words) currentAutomodConfig.banned_words = {};
    currentAutomodConfig.banned_words.enabled = document.getElementById('automod_banned_words_enabled').checked;
    if(!currentAutomodConfig.anti_spam) currentAutomodConfig.anti_spam = {};
    currentAutomodConfig.anti_spam.enabled = document.getElementById('automod_anti_spam_enabled').checked;
    if(!currentAutomodConfig.anti_invites) currentAutomodConfig.anti_invites = {};
    currentAutomodConfig.anti_invites.enabled = document.getElementById('automod_anti_invites_enabled').checked;
    if(!currentAutomodConfig.anti_link) currentAutomodConfig.anti_link = {};
    currentAutomodConfig.anti_link.enabled = document.getElementById('automod_anti_link_enabled').checked;
    if(!currentAutomodConfig.anti_caps) currentAutomodConfig.anti_caps = {};
    currentAutomodConfig.anti_caps.enabled = document.getElementById('automod_anti_caps_enabled').checked;
    if(!currentAutomodConfig.mention_spam) currentAutomodConfig.mention_spam = {};
    currentAutomodConfig.mention_spam.enabled = document.getElementById('automod_mention_spam_enabled').checked;
    if(!currentAutomodConfig.anti_alt) currentAutomodConfig.anti_alt = {};
    currentAutomodConfig.anti_alt.enabled = document.getElementById('automod_anti_alt_enabled').checked;
    


    const payload = {
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
        automod: currentAutomodConfig,
        verify: {
            enabled: document.getElementById('verify_enabled').checked,
            role_id: document.getElementById('verify_role_id').value,
            remove_role_id: document.getElementById('verify_remove_role_id').value,
            verification_type: document.getElementById('verify_type').value
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
        logs: {
            enabled: document.getElementById('logs_enabled').checked,
            executor_in_logs: document.getElementById('logs_executor_in_logs').checked,
            global_exempt_channels: Array.from(document.getElementById('logs_global_channels').selectedOptions).map(o => o.value),
            global_exempt_roles: Array.from(document.getElementById('logs_global_roles').selectedOptions).map(o => o.value),
            categories: {},
            channels: {}
        }
    };
    
    LOGS_CATEGORIES.forEach(cat => {
        const enCb = document.getElementById(`log_cat_${cat.id}_enabled`);
        const chSel = document.getElementById(`log_cat_${cat.id}_channel`);
        if (enCb) payload.logs.categories[cat.id] = enCb.checked;
        if (chSel) payload.logs.channels[cat.id] = chSel.value;
    });

    try {
        const res = await fetch(`/api/config/${currentGuildId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            showToast('Settings saved successfully!');
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
document.addEventListener('mousedown', function(e) {
    if (e.target.tagName === 'OPTION' && e.target.parentElement.hasAttribute('multiple')) {
        e.preventDefault();
        e.target.selected = !e.target.selected;
        e.target.parentElement.dispatchEvent(new Event('change'));
    }
});




