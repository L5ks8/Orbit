utf-8import os
import json
import pathlib
from typing import Dict, Any, Optional

STORAGE_ROOT = pathlib.Path("Storage")

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "verify.json"

def load_verify_config(guild_id: int) -> Dict[str, Any]:
    path = _get_file_path(guild_id)
    default_cfg = {"enabled": False, "channel_id": None, "role_id": None, "remove_role_id": None, "verification_type": "captcha", "auto_kick_minutes": 0, "pending_kicks": {}}
    
    if not path.exists():
        data = default_cfg.copy()
    else:
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = default_cfg.copy()

    if not isinstance(data, dict):
        data = default_cfg.copy()

    if "enabled" not in data:
        data["enabled"] = bool(data.get("channel_id") and data.get("role_id"))
    if "pending_kicks" not in data:
        data["pending_kicks"] = {}
    if "remove_role_id" not in data:
        data["remove_role_id"] = None
    if "verification_type" not in data:
        data["verification_type"] = "captcha"
    return data

def save_verify_config(guild_id: int, config: Dict[str, Any]) -> None:
    path = _get_file_path(guild_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=4)

def setup_verify_config(guild_id: int, channel_id: int, role_id: int, remove_role_id: Optional[int] = None, verification_type: str = "captcha", auto_kick_minutes: int = 0) -> Dict[str, Any]:
    config = load_verify_config(guild_id)
    config["enabled"] = True
    config["channel_id"] = channel_id
    config["role_id"] = role_id
    config["remove_role_id"] = remove_role_id
    config["verification_type"] = verification_type
    config["auto_kick_minutes"] = max(0, auto_kick_minutes)
    save_verify_config(guild_id, config)
    return config

def toggle_verify_config(guild_id: int) -> Dict[str, Any]:
    config = load_verify_config(guild_id)
    config["enabled"] = not config.get("enabled", False)
    save_verify_config(guild_id, config)
    return config

def reset_verify_config(guild_id: int) -> Dict[str, Any]:
    config = {
        "enabled": False,
        "channel_id": None,
        "role_id": None,
        "remove_role_id": None,
        "verification_type": "captcha",
        "auto_kick_minutes": 0,
        "pending_kicks": {}
    }
    save_verify_config(guild_id, config)
    return config

def add_pending_kick(guild_id: int, user_id: int, kick_timestamp: float) -> None:
    config = load_verify_config(guild_id)
    config["pending_kicks"][str(user_id)] = kick_timestamp
    save_verify_config(guild_id, config)

def remove_pending_kick(guild_id: int, user_id: int) -> None:
    config = load_verify_config(guild_id)
    if str(user_id) in config.get("pending_kicks", {}):
        del config["pending_kicks"][str(user_id)]
        save_verify_config(guild_id, config)
