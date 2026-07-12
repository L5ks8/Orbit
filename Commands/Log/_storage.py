import pathlib
from typing import Dict, Any
import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Commands.StorageEngine import get_json, save_json

STORAGE_ROOT = pathlib.Path("Storage")

DEFAULT_CATEGORIES = {
    "moderation": True,
    "messages": True,
    "members": True,
    "channels": True,
    "roles": True,
    "voice": True
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
        "channel_id": None,
        "categories": DEFAULT_CATEGORIES.copy(),
        "channels": {k: None for k in DEFAULT_CATEGORIES}
    }
    data = get_json(path, default)
    if not isinstance(data, dict):
        return default

    if "categories" not in data or not isinstance(data["categories"], dict):
        data["categories"] = DEFAULT_CATEGORIES.copy()
    else:
        for k, v in DEFAULT_CATEGORIES.items():
            if k not in data["categories"]:
                data["categories"][k] = v

    if "channels" not in data or not isinstance(data["channels"], dict):
        data["channels"] = {}
        for k in DEFAULT_CATEGORIES:
            if data["categories"].get(k) and data.get("channel_id"):
                data["channels"][k] = data.get("channel_id")
            else:
                data["channels"][k] = None
    else:
        for k in DEFAULT_CATEGORIES:
            if k not in data["channels"]:
                if data["categories"].get(k) and data.get("channel_id"):
                    data["channels"][k] = data.get("channel_id")
                else:
                    data["channels"][k] = None

    return data

def save_log_config(guild_id: int, config: Dict[str, Any]) -> None:
    path = _get_file_path(guild_id)
    save_json(path, config)

def setup_log(guild_id: int, default_channel_id: int = None, channel_overrides: Dict[str, int] = None) -> Dict[str, Any]:
    config = load_log_config(guild_id)
    config["enabled"] = True

    if default_channel_id is not None:
        config["channel_id"] = default_channel_id
        for k in DEFAULT_CATEGORIES:
            config["channels"][k] = default_channel_id
            config["categories"][k] = True

    if channel_overrides is not None:
        for cat, ch_id in channel_overrides.items():
            if cat in DEFAULT_CATEGORIES and ch_id is not None:
                config["channels"][cat] = ch_id
                config["categories"][cat] = True
                config["channel_id"] = ch_id

    if any(config["channels"].values()):
        config["enabled"] = True

    save_log_config(guild_id, config)
    return config

def toggle_log_category(guild_id: int, category: str) -> Dict[str, Any]:
    config = load_log_config(guild_id)
    if category.lower() == "all":
        channels_map = config.get("channels", {})
        all_on = config.get("enabled", False) and any(ch is not None for ch in channels_map.values())
        if all_on:
            config["enabled"] = False
            for k in DEFAULT_CATEGORIES:
                config["channels"][k] = None
                config["categories"][k] = False
        else:
            fallback_ch = config.get("channel_id")
            if not fallback_ch:
                for v in channels_map.values():
                    if v is not None:
                        fallback_ch = v
                        break
            config["enabled"] = True
            if fallback_ch:
                for k in DEFAULT_CATEGORIES:
                    config["channels"][k] = fallback_ch
                    config["categories"][k] = True
        save_log_config(guild_id, config)
        return config

    cat = category.lower()
    if cat in DEFAULT_CATEGORIES:
        current_ch = config["channels"].get(cat)
        if current_ch is not None:
            config["channels"][cat] = None
            config["categories"][cat] = False
        else:
            fallback_ch = config.get("channel_id")
            if not fallback_ch:
                for v in config.get("channels", {}).values():
                    if v is not None:
                        fallback_ch = v
                        break
            if fallback_ch:
                config["channels"][cat] = fallback_ch
                config["categories"][cat] = True
                config["enabled"] = True
        save_log_config(guild_id, config)
    return config

def reset_log_config(guild_id: int) -> None:
    path = _get_file_path(guild_id)
    if path.exists():
        try:
            path.unlink()
        except Exception:
            pass
    from Commands.StorageEngine import _RAM_CACHE, _DIRTY_FILES
    key = str(path)
    if key in _RAM_CACHE:
        del _RAM_CACHE[key]
    _DIRTY_FILES.discard(key)

async def log_event(guild: discord.Guild, category: str, title: str, description: str) -> None:
    if not guild:
        return
    config = load_log_config(guild.id)
    if not config.get("enabled"):
        return

    target_ch_id = config.get("channels", {}).get(category.lower())
    if not target_ch_id:
        if config.get("categories", {}).get(category.lower()) and config.get("channel_id"):
            target_ch_id = config.get("channel_id")
        else:
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

    container = Container(
        TextDisplay(content=f"### {title}"),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=description)
    )
    view = LayoutView()
    view.add_item(container)

    try:
        await channel.send(view=view, allowed_mentions=discord.AllowedMentions.none())
    except Exception:
        try:
            embed = discord.Embed(
                title=title,
                description=description,
                color=0x2b2d31,
                timestamp=discord.utils.utcnow()
            )
            await channel.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
        except Exception as e:
            try:
                from Storage._error_recorder import log_error_event
                log_error_event("Log Event Send Error", e, {"guild_id": guild.id, "category": category, "channel_id": ch_int})
            except Exception:
                pass
