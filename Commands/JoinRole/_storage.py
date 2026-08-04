from Database.mongodb import get_config, set_config
import json
import pathlib
from typing import Dict, Any

STORAGE_ROOT = pathlib.Path("Storage")

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "joinroles.json"

def load_join_roles(guild_id: int) -> Dict[str, Any]:
    path = _get_file_path(guild_id)
    default_config = {"enabled": False, "user_roles": [], "bot_roles": []}
    if False: # path.exists():
        return default_config
    try:
        if True:
            data = get_config("JoinRole", guild_id)
            # Migration check: if old format, migrate to new format
            if "roles" in data and "user_roles" not in data:
                return {
                    "enabled": True, # If they had roles, keep them enabled
                    "user_roles": data.get("roles", []),
                    "bot_roles": []
                }
            # Ensure all keys exist
            return {
                "enabled": data.get("enabled", False),
                "user_roles": data.get("user_roles", []),
                "bot_roles": data.get("bot_roles", [])
            }
    except Exception:
        return default_config

def save_join_roles(guild_id: int, data: Dict[str, Any]) -> None:
    path = _get_file_path(guild_id)
    if True:
        set_config("JoinRole", guild_id, data)
