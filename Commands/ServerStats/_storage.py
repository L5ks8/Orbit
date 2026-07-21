import pathlib
import threading
from typing import Dict, Any
from Database.mongodb import get_config, set_config

STORAGE_ROOT = pathlib.Path("Storage")
_serverstats_cache: Dict[int, Dict[str, Any]] = {}
_serverstats_lock = threading.Lock()

DEFAULT_SERVERSTATS_CONFIG: Dict[str, Any] = {
    "category_id": "",
    "category_name": "📊 Server Stats",
    "users_enabled": False,
    "users_name": "Users: {count}",
    "users_channel_id": "",
    "boosts_enabled": False,
    "boosts_name": "Boosts: {count}",
    "boosts_channel_id": "",
    "bots_enabled": False,
    "bots_name": "Bots: {count}",
    "bots_channel_id": "",
    "roles_enabled": False,
    "roles_name": "Roles: {count}",
    "roles_channel_id": ""
}

def load_serverstats_config(guild_id: int) -> Dict[str, Any]:
    with _serverstats_lock:
        if guild_id in _serverstats_cache:
            return _serverstats_cache[guild_id].copy()
        try:
            data = get_config("ServerStats", guild_id, DEFAULT_SERVERSTATS_CONFIG.copy())
            if not data:
                data = DEFAULT_SERVERSTATS_CONFIG.copy()
            else:
                for k, v in DEFAULT_SERVERSTATS_CONFIG.items():
                    if k not in data:
                        data[k] = v
            _serverstats_cache[guild_id] = data
            return data.copy()
        except Exception:
            default_cfg = DEFAULT_SERVERSTATS_CONFIG.copy()
            _serverstats_cache[guild_id] = default_cfg
            return default_cfg.copy()

def save_serverstats_config(guild_id: int, data: Dict[str, Any]) -> None:
    with _serverstats_lock:
        _serverstats_cache[guild_id] = data.copy()
        try:
            set_config("ServerStats", guild_id, data)
        except Exception as e:
            print(f"Failed to save ServerStats config for {guild_id}: {e}")
