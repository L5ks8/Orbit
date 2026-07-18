import pathlib
import json
from typing import Dict, Any
import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator

STORAGE_ROOT = pathlib.Path("Storage")

DEFAULT_CATEGORIES = {
    "moderation_action": True,
    "auto_moderation": True,
    "message_deleted": True,
    "message_edited": True,
    "bulk_message_delete": True,
    "member_joined": True,
    "member_left": True,
    "member_joined_voice": True,
    "member_left_voice": True,
    "member_moved_voice": True,
    "voice_mute": True,
    "voice_unmute": True,
    "voice_deafen": True,
    "voice_undeafen": True,
    "member_banned": True,
    "member_unbanned": True,
    "member_kicked": True,
    "role_created": True,
    "role_deleted": True,
    "role_updated": True,
    "channel_created": True,
    "channel_deleted": True,
    "channel_updated": True,
    "scheduled_event_created": True,
    "scheduled_event_deleted": True,
    "scheduled_event_updated": True,
    "mod_command_used": True
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
    
    if not path.exists():
        data = default.copy()
    else:
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
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
    with open(path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=4)

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

    container = Container(
        TextDisplay(content=f"### {title}"),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=description)
    )
    view = LayoutView()
    view.add_item(container)

    try:
        await channel.send(content=role_ping, view=view, allowed_mentions=discord.AllowedMentions.none())
    except Exception:
        try:
            embed = discord.Embed(
                title=title,
                description=description,
                color=0x2b2d31,
                timestamp=discord.utils.utcnow()
            )
            await channel.send(content=role_ping, embed=embed, allowed_mentions=discord.AllowedMentions.none())
        except Exception as e:
            pass

