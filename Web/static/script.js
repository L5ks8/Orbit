let currentUser = null;
let currentGuildId = null;

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
            document.getElementById('btn-hero-login').innerText = "Go to Dashboard";
            document.getElementById('btn-hero-login').onclick = loadDashboard;
        } else {
            document.getElementById('btn-hero-login').onclick = () => window.location.href = '/auth/login';
            document.getElementById('btn-login').onclick = () => window.location.href = '/auth/login';
        }
    } catch (e) {
        console.error("Init error", e);
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
        
        this.trigger.addEventListener('click', () => {
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
        const item = this.items.find(i => i.id === this.value);
        if (item) {
            this.trigger.innerHTML = `<div class="content"><span class="color-dot" style="background:${item.color}"></span> @${item.name}</div> <span style="font-size:10px">▼</span>`;
        } else {
            this.trigger.innerHTML = `<div class="content" style="color:var(--text-secondary)">${placeholder}</div> <span style="font-size:10px">▼</span>`;
        }
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
            opt.className = `custom-select-option ${this.value === item.id ? 'selected' : ''}`;
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

let globalRoles = [];
let globalCategories = [];
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
        addAutoReplyRow(trigger, data.response);
    }
}

function addAutoReplyRow(triggerText = '', responseText = '') {
    const list = document.getElementById('autoreply-list');
    if (list.querySelector('p')) list.innerHTML = ''; // Clear empty message

    const row = document.createElement('div');
    row.className = 'autoreply-row';
    row.style.cssText = 'display: flex; gap: 10px; background: var(--bg-color); padding: 10px; border-radius: 6px; border: 1px solid var(--border-color);';
    
    row.innerHTML = `
        <input type="text" class="ar-trigger" value="${triggerText.replace(/"/g, '&quot;')}" placeholder="Trigger (e.g. !help)" style="flex: 1; min-width: 0; background: #000000; border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px; border-radius: 4px; outline: none;">
        <input type="text" class="ar-response" value="${responseText.replace(/"/g, '&quot;')}" placeholder="Bot Response" style="flex: 2; min-width: 0; background: #000000; border: 1px solid var(--border-color); color: var(--text-primary); padding: 8px; border-radius: 4px; outline: none;">
        <button type="button" class="btn-danger" style="padding: 0 12px; font-size: 16px;" onclick="this.parentElement.remove()">×</button>
    `;
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
    btnRemove.innerText = '×';
    btnRemove.onclick = () => row.remove();

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
    btnRemove.innerText = '×';
    btnRemove.onclick = () => row.remove();
    
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

        // Populate normal selects (channels)
        const welcomeSelect = document.getElementById('welcome_channel_id');
        welcomeSelect.innerHTML = '<option value="">None</option>';
        const verifyPanelSelect = document.getElementById('verify_panel_channel');
        verifyPanelSelect.innerHTML = '<option value="">Select Channel...</option>';
        const ticketPanelSelect = document.getElementById('ticket_panel_channel');
        ticketPanelSelect.innerHTML = '<option value="">Select Channel...</option>';
        const ticketLogSelect = document.getElementById('ticket_log_channel_id');
        ticketLogSelect.innerHTML = '<option value="">None</option>';
        data.channels.forEach(c => {
            welcomeSelect.innerHTML += `<option value="${c.id}">#${c.name}</option>`;
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
        document.getElementById('welcome_image_url').value = config.welcome?.image_url || '';

        // AutoMod
        if (!currentPermissions.can_messages) lockSection('section-automod', 'Manage Messages');
        document.getElementById('automod_enabled').checked = config.automod?.enabled || false;
        document.getElementById('automod_anti_link').checked = config.automod?.anti_link?.enabled || false;
        document.getElementById('automod_anti_spam').checked = config.automod?.anti_spam?.enabled || false;

        // Verify
        if (!currentPermissions.can_roles) lockSection('section-verify', 'Manage Roles');
        document.getElementById('verify_enabled').checked = config.verify?.enabled || false;
        document.getElementById('verify_type').value = config.verify?.verification_type || 'captcha';

        // Ticket
        if (!currentPermissions.can_channels) lockSection('section-ticket', 'Manage Channels');
        document.getElementById('ticket_enabled').checked = config.ticket?.enabled || false;
        document.getElementById('ticket_panel_title').value = config.ticket?.panel_title || 'Support Ticket Desk';
        document.getElementById('ticket_panel_description').value = config.ticket?.panel_description || 'Click the button below to open a direct support channel with our team.';
        document.getElementById('ticket_panel_instructions').value = config.ticket?.panel_instructions || 'Select your desired inquiry category in the dropdown menu below, then click Create Ticket to open your private channel.';
        document.getElementById('ticket_panel_channel').value = config.ticket?.panel_channel_id || '';
        document.getElementById('ticket_log_channel_id').value = config.ticket?.log_channel_id || '';

        // Clear existing custom selects
        document.querySelectorAll('.custom-select').forEach(el => el.remove());

        // Initialize Custom Selects for Roles
        new CustomSelect(document.getElementById('verify_role_id'), globalRoles, config.verify?.role_id || '', 'Select Verified Role...');
        new CustomSelect(document.getElementById('verify_remove_role_id'), globalRoles, config.verify?.remove_role_id || '', 'Select Unverified Role...');

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
        console.error(e);
        document.getElementById('config-loader').innerHTML = `<p style="color:red;">Error loading configuration.</p>`;
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
    
    // Replace placeholders
    let formattedText = msgInput
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

document.getElementById('welcome_message').addEventListener('input', updateLivePreview);
document.getElementById('welcome_image_url').addEventListener('input', updateLivePreview);

document.getElementById('btn-send-verify').addEventListener('click', async () => {
    if (!currentGuildId) return;
    const channelId = document.getElementById('verify_panel_channel').value;
    if (!channelId) {
        showToast("Please select a channel to send the panel to.");
        return;
    }
    
    try {
        const res = await fetch(`/api/action/${currentGuildId}/send_verify_panel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channel_id: channelId })
        });
        if (res.ok) showToast("Verify Panel sent successfully!");
        else showToast("Failed to send Verify Panel.");
    } catch (e) {
        showToast("Error sending panel.");
    }
});

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

// Save Settings
document.getElementById('config-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentGuildId) return;

    const btn = document.getElementById('btn-save');
    btn.innerText = 'Saving...';
    btn.disabled = true;

    // Collect AutoResponder Data
    const autoresponder = {};
    document.querySelectorAll('.autoreply-row').forEach(row => {
        const trigger = row.querySelector('.ar-trigger').value.trim();
        const response = row.querySelector('.ar-response').value.trim();
        if (trigger && response) {
            autoresponder[trigger] = { response: response, channel_id: null };
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

    const payload = {
        welcome: {
            enabled: document.getElementById('welcome_enabled').checked,
            channel_id: document.getElementById('welcome_channel_id').value,
            message: document.getElementById('welcome_message').value,
            image_url: document.getElementById('welcome_image_url').value
        },
        automod: {
            enabled: document.getElementById('automod_enabled').checked,
            anti_link: { enabled: document.getElementById('automod_anti_link').checked },
            anti_spam: { enabled: document.getElementById('automod_anti_spam').checked }
        },
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
        autoresponder: autoresponder,
        joinroles: joinroles
    };

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
