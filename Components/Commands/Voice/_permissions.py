import os
import json
import discord
from Components.Systems.JoinToCreate._storage import get_active_channel

def is_guild_or_bot_owner(member: discord.Member) -> bool:
    if not member or not member.guild:
        return False
    if member.id == member.guild.owner_id:
        return True
    try:
        path = os.path.join("Components/Database", "developers.json")
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                devs = json.load(f)
            if member.id in devs:
                return True
    except Exception:
        pass
    return False

def can_manage_channel(member: discord.Member, channel: discord.VoiceChannel | None = None) -> tuple[bool, str]:
    """
    Check if member has permission to manage (lock/unlock/limit) the voice channel.
    Returns (allowed, error_reason).
    Allowed if:
    - Member is guild owner or bot developer
    - Member has Administrator or Manage Channels permission in the guild
    - Channel is an active TempVoice (JoinToCreate) channel owned by member
    """
    if is_guild_or_bot_owner(member):
        return True, ""
    
    if member.guild_permissions.administrator or member.guild_permissions.manage_channels:
        return True, ""
        
    if channel and member.guild:
        data = get_active_channel(member.guild.id, channel.id)
        if data and data.get("owner_id") == member.id:
            return True, ""

    return False, "You do not have permission to manage this voice channel. You need the `Manage Channels` permission (or be the owner of this temporary voice channel)."

def can_voice_ban(member: discord.Member) -> tuple[bool, str]:
    """
    Check if member has permission to voice ban/unban members.
    Requires move_members, ban_members, or manage_channels (or administrator/owner).
    """
    if is_guild_or_bot_owner(member):
        return True, ""
    perms = member.guild_permissions
    if perms.administrator or perms.move_members or perms.ban_members or perms.manage_channels:
        return True, ""
    return False, "You do not have permission to voice ban members. You need the `Move Members` or `Ban Members` permission."

def can_voice_mute(member: discord.Member) -> tuple[bool, str]:
    """
    Check if member has permission to voice mute/unmute members.
    Requires mute_members (or manage_channels/administrator/owner).
    """
    if is_guild_or_bot_owner(member):
        return True, ""
    perms = member.guild_permissions
    if perms.administrator or perms.mute_members or perms.manage_channels:
        return True, ""
    return False, "You do not have permission to voice mute members. You need the `Mute Members` permission."

def can_voice_move(member: discord.Member) -> tuple[bool, str]:
    """
    Check if member has permission to move members between voice channels.
    Requires move_members (or manage_channels/administrator/owner).
    """
    if is_guild_or_bot_owner(member):
        return True, ""
    perms = member.guild_permissions
    if perms.administrator or perms.move_members or perms.manage_channels:
        return True, ""
    return False, "You do not have permission to move members. You need the `Move Members` permission."

def can_voice_say(member: discord.Member) -> tuple[bool, str]:
    """
    Check if member has permission to use voice TTS say.
    Requires manage_messages, manage_channels, or move_members (or administrator/owner).
    """
    if is_guild_or_bot_owner(member):
        return True, ""
    perms = member.guild_permissions
    if perms.administrator or perms.manage_messages or perms.manage_channels or perms.move_members:
        return True, ""
    return False, "You do not have permission to use voice TTS. You need the `Manage Messages` or `Manage Channels` permission."
