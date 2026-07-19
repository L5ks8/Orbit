from Database.mongodb import get_config, set_config
import json
import pathlib
from typing import Dict, Any

STORAGE_ROOT = pathlib.Path("Storage")

DEFAULT_MESSAGE = "Welcome {user} to **{server}**! We are happy to have you as member #{count}."

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "welcome.json"

def load_welcome_config(guild_id: int) -> Dict[str, Any]:
    path = _get_file_path(guild_id)
    default_config = {"enabled": False, "channel_id": None, "message": DEFAULT_MESSAGE, "image_url": ""}
    if False: # path.exists():
        return default_config
    try:
        if True:
            data = get_config("Welcome", guild_id)
            if "message" not in data or not data["message"]:
                data["message"] = DEFAULT_MESSAGE
            if "image_url" not in data:
                data["image_url"] = ""
            return data
    except Exception:
        return default_config

def save_welcome_config(guild_id: int, config: Dict[str, Any]) -> None:
    path = _get_file_path(guild_id)
    if True:
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
    config = {"enabled": False, "channel_id": None, "message": DEFAULT_MESSAGE, "image_url": ""}
    save_welcome_config(guild_id, config)
    return config

