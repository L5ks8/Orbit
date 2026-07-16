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
                    <p>Manage Server</p>
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

function renderAutoReplies(replies) {
    const list = document.getElementById('autoreply-list');
    list.innerHTML = '';
    if (Object.keys(replies).length === 0) {
        list.innerHTML = '<p style="color:var(--text-secondary);font-size:13px;">No auto-replies configured.</p>';
        return;
    }
    for (const [trigger, config] of Object.entries(replies)) {
        addAutoReplyRow(trigger, config.response);
    }
}

function addAutoReplyRow(trigger = '', response = '') {
    const list = document.getElementById('autoreply-list');
    if (list.innerHTML.includes('No auto-replies')) list.innerHTML = '';
    
    const row = document.createElement('div');
    row.className = 'autoreply-row';
    row.style = 'display:flex; gap:10px; align-items:center; background:#151515; padding:10px; border-radius:6px; border:1px solid var(--border-color)';
    row.innerHTML = `
        <input type="text" placeholder="Trigger word (e.g. !ip)" value="${trigger.replace(/"/g, '&quot;')}" class="ar-trigger" style="flex:1" required>
        <input type="text" placeholder="Bot response" value="${response.replace(/"/g, '&quot;')}" class="ar-response" style="flex:2" required>
        <button type="button" class="btn-secondary" style="padding:12px; color:#ff4444; border-color:#ff4444" onclick="this.parentElement.remove()">X</button>
    `;
    list.appendChild(row);
}

function renderJoinRoles(rolesList) {
    const list = document.getElementById('joinrole-list');
    list.innerHTML = '';
    if (rolesList.length === 0) {
        list.innerHTML = '<p style="color:var(--text-secondary);font-size:13px;">No join roles configured.</p>';
        return;
    }
    rolesList.forEach(r => addJoinRoleRow(r));
}

function addJoinRoleRow(selectedRoleId = '') {
    const list = document.getElementById('joinrole-list');
    if (list.innerHTML.includes('No join roles')) list.innerHTML = '';
    
    const row = document.createElement('div');
    row.style = 'display:flex; gap:10px; align-items:center;';
    
    const select = document.createElement('select');
    select.className = 'jr-select';
    select.style.flex = '1';
    select.required = true;
    
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-secondary';
    btn.style = 'padding:12px; color:#ff4444; border-color:#ff4444';
    btn.innerText = 'X';
    btn.onclick = () => row.remove();
    
    row.appendChild(select);
    row.appendChild(btn);
    list.appendChild(row);
    
    new CustomSelect(select, globalRoles, selectedRoleId, 'Select Role...');
}

document.getElementById('btn-add-autoreply').addEventListener('click', () => addAutoReplyRow());
document.getElementById('btn-add-joinrole').addEventListener('click', () => addJoinRoleRow());

async function loadConfig(guildId, guildName) {
    currentGuildId = guildId;
    document.getElementById('config-server-name').innerText = guildName;
    showView('config');
    
    document.getElementById('config-layout').style.display = 'none';
    document.getElementById('config-loader').classList.remove('hidden');

    try {
        const res = await fetch(`/api/config/${guildId}`);
        const data = await res.json();
        globalRoles = data.roles;

        // Populate normal selects (channels & categories)
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

        const ticketCategorySelect = document.getElementById('ticket_category_id');
        ticketCategorySelect.innerHTML = '<option value="">None</option>';
        data.categories.forEach(c => {
            ticketCategorySelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });

        // Set values
        const config = data.config;
        
        // Welcome
        document.getElementById('welcome_enabled').checked = config.welcome?.enabled || false;
        document.getElementById('welcome_channel_id').value = config.welcome?.channel_id || '';
        document.getElementById('welcome_message').value = config.welcome?.message || 'Welcome {user} to {server}!';
        document.getElementById('welcome_image_url').value = config.welcome?.image_url || '';

        // AutoMod
        document.getElementById('automod_enabled').checked = config.automod?.enabled || false;
        document.getElementById('automod_anti_link').checked = config.automod?.anti_link?.enabled || false;
        document.getElementById('automod_anti_spam').checked = config.automod?.anti_spam?.enabled || false;

        // Verify
        document.getElementById('verify_enabled').checked = config.verify?.enabled || false;
        document.getElementById('verify_type').value = config.verify?.verification_type || 'captcha';

        // Ticket
        document.getElementById('ticket_enabled').checked = config.ticket?.enabled || false;
        document.getElementById('ticket_panel_channel').value = config.ticket?.panel_channel_id || '';
        document.getElementById('ticket_category_id').value = config.ticket?.category_id || '';
        document.getElementById('ticket_log_channel_id').value = config.ticket?.log_channel_id || '';

        // Clear existing custom selects
        document.querySelectorAll('.custom-select').forEach(el => el.remove());

        // Initialize Custom Selects for Roles
        new CustomSelect(document.getElementById('verify_role_id'), globalRoles, config.verify?.role_id || '', 'Select Verified Role...');
        new CustomSelect(document.getElementById('verify_remove_role_id'), globalRoles, config.verify?.remove_role_id || '', 'Select Unverified Role...');
        new CustomSelect(document.getElementById('ticket_support_role_id'), globalRoles, config.ticket?.support_role_id || '', 'Select Support Role...');

        // AutoResponder & JoinRoles
        renderAutoReplies(config.autoresponder || {});
        renderJoinRoles(config.joinroles || []);
        
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
        alert("Please select a channel first.");
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
            alert('Verification Panel successfully sent to the channel!');
        } else {
            const data = await res.json();
            alert('Failed: ' + (data.error || 'Unknown error'));
        }
    } catch (e) {
        alert('An error occurred.');
    } finally {
        btn.innerText = 'Send Panel';
        btn.disabled = false;
    }
});

// Sidebar Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelectorAll('.settings-section').forEach(sec => sec.classList.remove('active'));
        
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
        .replace(/{user}/g, '<span style="background: rgba(88, 101, 242, 0.3); color: #C9CDFB; padding: 0 2px; border-radius: 3px;">@User</span>')
        .replace(/{server}/g, '<b>Orbit</b>')
        .replace(/{count}/g, '<b>100</b>');
        
    document.getElementById('dp-text').innerHTML = formattedText || '<i>No message configured</i>';
    
    const imgContainer = document.getElementById('dp-image');
    const imgPlaceholder = document.getElementById('dp-image-placeholder');
    const imgElement = document.getElementById('dp-image-element');
    
    if (imgInput) {
        imgPlaceholder.style.display = 'none';
        imgElement.src = imgInput;
        imgElement.style.display = 'block';
    } else {
        imgPlaceholder.style.display = 'inline';
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
        alert("Please select a channel to send the panel to.");
        return;
    }
    
    try {
        const res = await fetch(`/api/action/${currentGuildId}/send_verify_panel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channel_id: channelId })
        });
        if (res.ok) alert("Verify Panel sent successfully!");
        else alert("Failed to send Verify Panel.");
    } catch (e) {
        alert("Error sending panel.");
    }
});

document.getElementById('btn-send-ticket').addEventListener('click', async () => {
    if (!currentGuildId) return;
    const channelId = document.getElementById('ticket_panel_channel').value;
    if (!channelId) {
        alert("Please select a channel to send the ticket panel to.");
        return;
    }
    
    try {
        const res = await fetch(`/api/action/${currentGuildId}/send_ticket_panel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channel_id: channelId })
        });
        if (res.ok) alert("Ticket Panel sent successfully!");
        else alert("Failed to send Ticket Panel.");
    } catch (e) {
        alert("Error sending panel.");
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
            panel_channel_id: document.getElementById('ticket_panel_channel').value,
            category_id: document.getElementById('ticket_category_id').value,
            support_role_id: document.getElementById('ticket_support_role_id').value,
            log_channel_id: document.getElementById('ticket_log_channel_id').value
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
            alert('Settings saved successfully!');
        } else {
            const data = await res.json();
            alert('Error: ' + (data.error || 'Unknown error'));
        }
    } catch (e) {
        alert('An error occurred while saving.');
    } finally {
        btn.innerText = 'Save Changes';
        btn.disabled = false;
    }
});

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

init();
