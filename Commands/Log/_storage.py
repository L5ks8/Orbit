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
    default = {"enabled": False, "channel_id": None, "categories": DEFAULT_CATEGORIES.copy()}
    data = get_json(path, default)
    if not isinstance(data, dict):
        return default
    if "categories" not in data or not isinstance(data["categories"], dict):
        data["categories"] = DEFAULT_CATEGORIES.copy()
    else:
        for k, v in DEFAULT_CATEGORIES.items():
            if k not in data["categories"]:
                data["categories"][k] = v
    return data

def save_log_config(guild_id: int, config: Dict[str, Any]) -> None:
    path = _get_file_path(guild_id)
    save_json(path, config)

def setup_log(guild_id: int, channel_id: int = None, categories: Dict[str, bool] = None, enabled: bool = True) -> Dict[str, Any]:
    config = load_log_config(guild_id)
    config["enabled"] = enabled
    if channel_id is not None:
        config["channel_id"] = channel_id
    if categories is not None:
        for cat, state in categories.items():
            if cat in config["categories"] and state is not None:
                config["categories"][cat] = bool(state)
    save_log_config(guild_id, config)
    return config

def toggle_log_category(guild_id: int, category: str) -> Dict[str, Any]:
    config = load_log_config(guild_id)
    if category.lower() == "all":
        cats = config.get("categories", {})
        all_on = config.get("enabled", False) and all(cats.values())
        new_state = not all_on
        config["enabled"] = new_state
        for k in cats:
            cats[k] = new_state
        save_log_config(guild_id, config)
        return config

    cat = category.lower()
    if cat in config["categories"]:
        config["categories"][cat] = not config["categories"][cat]
        if config["categories"][cat]:
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
    if not config.get("enabled") or not config.get("channel_id"):
        return
    if category.lower() not in config.get("categories", {}) or not config["categories"].get(category.lower(), False):
        return

    channel = guild.get_channel(config["channel_id"])
    if not channel or not isinstance(channel, discord.TextChannel):
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
        pass
