from Components.Database.mongodb import get_config, set_config
import pathlib
from typing import Dict, Any

STORAGE_ROOT = pathlib.Path("Storage")

DEFAULT_WELCOME_MESSAGE = "Welcome {user} to **{server}**! We are happy to have you as member #{count}."
DEFAULT_GOODBYE_MESSAGE = "We're sad to see you go, {user}! We hope you enjoyed your time in **{server}**."
# Backward compatibility alias
DEFAULT_MESSAGE = DEFAULT_WELCOME_MESSAGE

def _get_welcome_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "welcome.json"

def _get_goodbye_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "goodbye.json"

def load_welcome_config(guild_id: int) -> Dict[str, Any]:
    default_config = {
        "enabled": False, 
        "channel_id": None, 
        "dm_enabled": False,
        "dm_message": "", 
        "message": DEFAULT_WELCOME_MESSAGE, 
        "image_url": "",
        "msg_mode": "image",
        "embed_color": "#5865F2",
        "embed_title": "",
        "embed_description": "",
        "embed_thumbnail": "",
        "embed_footer": "",
        "embed_author": "",
        "embed_author_icon": "",
        "embed_footer_icon": "",
        "embed_fields": []
    }
    try:
        data = get_config("Welcome", guild_id, default_config)
        merged = {**default_config, **(data or {})}
        if not merged.get("message"):
            merged["message"] = DEFAULT_WELCOME_MESSAGE
        if not isinstance(merged.get("embed_fields"), list):
            merged["embed_fields"] = []
        return merged
    except Exception:
        return default_config

def save_welcome_config(guild_id: int, config: Dict[str, Any]) -> None:
    set_config("Welcome", guild_id, config)

def setup_welcome(guild_id: int, channel_id: int, message: str = None, image_url: str = None) -> Dict[str, Any]:
    config = load_welcome_config(guild_id)
    config["enabled"] = True
    config["channel_id"] = channel_id
    if message and message.strip():
        config["message"] = message.strip()
    if image_url is not None:
        config["image_url"] = image_url.strip()
    save_welcome_config(guild_id, config)
    return config

def set_welcome_status(guild_id: int, enabled: bool) -> Dict[str, Any]:
    config = load_welcome_config(guild_id)
    config["enabled"] = enabled
    save_welcome_config(guild_id, config)
    return config

def reset_welcome(guild_id: int) -> Dict[str, Any]:
    config = {
        "enabled": False, 
        "channel_id": None, 
        "dm_enabled": False,
        "dm_message": "", 
        "message": DEFAULT_WELCOME_MESSAGE, 
        "image_url": "",
        "msg_mode": "image",
        "embed_color": "#5865F2",
        "embed_title": "",
        "embed_description": "",
        "embed_thumbnail": "",
        "embed_footer": "",
        "embed_author": "",
        "embed_author_icon": "",
        "embed_footer_icon": "",
        "embed_fields": []
    }
    save_welcome_config(guild_id, config)
    return config

def load_goodbye_config(guild_id: int) -> Dict[str, Any]:
    default_config = {
        "enabled": False, 
        "channel_id": None, 
        "dm_enabled": False,
        "dm_message": "", 
        "message": DEFAULT_GOODBYE_MESSAGE, 
        "image_url": "",
        "msg_mode": "image",
        "embed_color": "#ED4245",
        "embed_title": "",
        "embed_description": "",
        "embed_thumbnail": "",
        "embed_footer": "",
        "embed_author": "",
        "embed_author_icon": "",
        "embed_footer_icon": "",
        "embed_fields": []
    }
    try:
        data = get_config("Goodbye", guild_id, default_config)
        merged = {**default_config, **(data or {})}
        if not merged.get("message"):
            merged["message"] = DEFAULT_GOODBYE_MESSAGE
        if not isinstance(merged.get("embed_fields"), list):
            merged["embed_fields"] = []
        return merged
    except Exception:
        return default_config

def save_goodbye_config(guild_id: int, config: Dict[str, Any]) -> None:
    set_config("Goodbye", guild_id, config)

def setup_goodbye(guild_id: int, channel_id: int, message: str = None, image_url: str = None) -> Dict[str, Any]:
    config = load_goodbye_config(guild_id)
    config["enabled"] = True
    config["channel_id"] = channel_id
    if message and message.strip():
        config["message"] = message.strip()
    if image_url is not None:
        config["image_url"] = image_url.strip()
    save_goodbye_config(guild_id, config)
    return config

def set_goodbye_status(guild_id: int, enabled: bool) -> Dict[str, Any]:
    config = load_goodbye_config(guild_id)
    config["enabled"] = enabled
    save_goodbye_config(guild_id, config)
    return config

def reset_goodbye(guild_id: int) -> Dict[str, Any]:
    config = {
        "enabled": False, 
        "channel_id": None, 
        "dm_enabled": False,
        "dm_message": "", 
        "message": DEFAULT_GOODBYE_MESSAGE, 
        "image_url": "",
        "msg_mode": "image",
        "embed_color": "#ED4245",
        "embed_title": "",
        "embed_description": "",
        "embed_thumbnail": "",
        "embed_footer": "",
        "embed_author": "",
        "embed_author_icon": "",
        "embed_footer_icon": "",
        "embed_fields": []
    }
    save_goodbye_config(guild_id, config)
    return config
