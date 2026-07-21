from Database.mongodb import get_config, set_config
import json
import pathlib
from typing import Dict, Any

STORAGE_ROOT = pathlib.Path("Storage")

DEFAULT_MESSAGE = "We're sad to see you go, {user}! We hope you enjoyed your time in **{server}**."

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "goodbye.json"

def load_goodbye_config(guild_id: int) -> Dict[str, Any]:
    path = _get_file_path(guild_id)
    default_config = {
        "enabled": False, 
        "channel_id": None, 
        "message": DEFAULT_MESSAGE, 
        "image_url": "",
        "msg_mode": "image",
        "embed_color": "#ED4245",
        "embed_title": "",
        "embed_description": "",
        "embed_thumbnail": "",
        "embed_footer": "",
        "embed_author": ""
    }
    try:
        data = get_config("Goodbye", guild_id)
        if "message" not in data or not data["message"]:
            data["message"] = DEFAULT_MESSAGE
        if "image_url" not in data:
            data["image_url"] = ""
        if "msg_mode" not in data:
            data["msg_mode"] = "image"
        if "embed_color" not in data:
            data["embed_color"] = "#ED4245"
        if "embed_title" not in data:
            data["embed_title"] = ""
        if "embed_description" not in data:
            data["embed_description"] = ""
        if "embed_thumbnail" not in data:
            data["embed_thumbnail"] = ""
        if "embed_footer" not in data:
            data["embed_footer"] = ""
        if "embed_author" not in data:
            data["embed_author"] = ""
        return data
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
        "message": DEFAULT_MESSAGE, 
        "image_url": "",
        "msg_mode": "image",
        "embed_color": "#ED4245",
        "embed_title": "",
        "embed_description": "",
        "embed_thumbnail": "",
        "embed_footer": "",
        "embed_author": ""
    }
    save_goodbye_config(guild_id, config)
    return config
