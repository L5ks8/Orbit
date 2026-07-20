from Database.mongodb import get_config, set_config
import pathlib
import json
from typing import Dict, Any
import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

STORAGE_ROOT = pathlib.Path("Storage")

DEFAULT_CATEGORIES = {
    "moderation_action": False,
    "auto_moderation": False,
    "message_deleted": False,
    "message_edited": False,
    "bulk_message_delete": False,
    "member_joined": False,
    "member_left": False,
    "member_joined_voice": False,
    "member_left_voice": False,
    "member_moved_voice": False,
    "voice_mute": False,
    "voice_unmute": False,
    "voice_deafen": False,
    "voice_undeafen": False,
    "member_banned": False,
    "member_unbanned": False,
    "member_kicked": False,
    "role_created": False,
    "role_deleted": False,
    "role_updated": False,
    "channel_created": False,
    "channel_deleted": False,
    "channel_updated": False,
    "scheduled_event_created": False,
    "scheduled_event_deleted": False,
    "scheduled_event_updated": False,
    "mod_command_used": False
}

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "logs.json"

def load_log_config(guild_id: int) -> Dict[str, Any]:
    path = _get_file_path(guild_id)
    default = {
        "enabled": False,
        "executor_in_logs": False,
        "global_exempt_channels": [],
        "global_exempt_roles": [],
        "categories": DEFAULT_CATEGORIES.copy(),
        "channels": {k: None for k in DEFAULT_CATEGORIES},
        "roles": {k: None for k in DEFAULT_CATEGORIES}
    }
    
    try:
        data = get_config("Log", guild_id)
        if not data:
            data = default.copy()
    except Exception:
        data = default.copy()

    if not isinstance(data, dict):
        return default.copy()

    if "categories" not in data or not isinstance(data["categories"], dict):
        data["categories"] = DEFAULT_CATEGORIES.copy()
    else:
        for k, v in DEFAULT_CATEGORIES.items():
            if k not in data["categories"]:
                data["categories"][k] = v

    if "executor_in_logs" not in data:
        data["executor_in_logs"] = False
    if "global_exempt_channels" not in data:
        data["global_exempt_channels"] = []
    if "global_exempt_roles" not in data:
        data["global_exempt_roles"] = []

    if "channels" not in data or not isinstance(data["channels"], dict):
        data["channels"] = {}
        for k in DEFAULT_CATEGORIES:
            data["channels"][k] = None
    else:
        for k in DEFAULT_CATEGORIES:
            if k not in data["channels"]:
                data["channels"][k] = None

    if "roles" not in data or not isinstance(data["roles"], dict):
        data["roles"] = {}
        for k in DEFAULT_CATEGORIES:
            data["roles"][k] = None
    else:
        for k in DEFAULT_CATEGORIES:
            if k not in data["roles"]:
                data["roles"][k] = None

    return data

def save_log_config(guild_id: int, config: Dict[str, Any]) -> None:
    path = _get_file_path(guild_id)
    if True:
        set_config("Log", guild_id, config)

async def log_event(guild: discord.Guild, category: str, title: str, description: str, target_channel_obj: discord.abc.GuildChannel = None, executor: discord.Member = None) -> None:
    if not guild:
        return
    config = load_log_config(guild.id)
    if not config.get("enabled"):
        return
        
    if target_channel_obj and hasattr(target_channel_obj, "id"):
        if str(target_channel_obj.id) in config.get("global_exempt_channels", []):
            return
            
    if executor and hasattr(executor, "roles"):
        if any(str(r.id) in config.get("global_exempt_roles", []) for r in executor.roles):
            return

    if executor and config.get("executor_in_logs"):
        description += f"\n**Executor:** {executor.mention} (`{executor.id}`)"

    target_ch_id = config.get("channels", {}).get(category.lower())
    if not target_ch_id or not config.get("categories", {}).get(category.lower()):
        return

    try:
        ch_int = int(target_ch_id)
    except Exception:
        return

    channel = guild.get_channel(ch_int)
    if not channel:
        try:
            channel = await guild.fetch_channel(ch_int)
        except Exception:
            pass

    if not channel or not isinstance(channel, (discord.TextChannel, discord.VoiceChannel, discord.StageChannel, discord.ForumChannel, discord.Thread)):
        return

    role_ping = None
    target_role_id = config.get("roles", {}).get(category.lower())
    if target_role_id:
        try:
            r_int = int(target_role_id)
            role = guild.get_role(r_int)
            if role:
                role_ping = role.mention
        except Exception:
            pass

    from Embeds import get_command_embed
    kwargs = get_command_embed(guild.id, "log", msg_type="event", title=title, description=description)

    try:
        await channel.send(content=role_ping, **kwargs, allowed_mentions=discord.AllowedMentions.none())
    except Exception as e:
        pass

