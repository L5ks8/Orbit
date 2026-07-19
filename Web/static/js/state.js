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

