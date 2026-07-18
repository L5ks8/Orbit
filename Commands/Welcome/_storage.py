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
    if not path.exists():
        return default_config
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if "message" not in data or not data["message"]:
                data["message"] = DEFAULT_MESSAGE
            if "image_url" not in data:
                data["image_url"] = ""
            return data
    except Exception:
        return default_config

def save_welcome_config(guild_id: int, config: Dict[str, Any]) -> None:
    path = _get_file_path(guild_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=4)

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

