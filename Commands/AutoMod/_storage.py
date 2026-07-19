from Database.mongodb import get_config, set_config
import json
import pathlib
import os
import threading
from typing import Dict, Any

STORAGE_ROOT = pathlib.Path("Storage")
_automod_cache: Dict[int, Dict[str, Any]] = {}
_automod_lock = threading.Lock()

DEFAULT_AUTOMOD_CONFIG = {
    "enabled": True,
    "anti_link": {
        "enabled": True,
        "delete_msg": True,
        "action": "warn",
        "timeout_duration_min": 5,
        "blocked_domains": ["discord.gg/", "discord.com/invite/", "dsc.gg/", "invite.gg/"],
        "whitelist_roles": []
    },
    "anti_spam": {
        "enabled": True,
        "max_messages": 5,
        "time_window_sec": 3,
        "max_mentions": 4,
        "action": "warn",
        "timeout_duration_min": 5
    },
    "anti_alt": {
        "enabled": True,
        "min_age_days": 3,
        "action": "kick"
    }
}

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        try:
            folder.mkdir(parents=True, exist_ok=True)
            os.chmod(folder, 0o777)
        except Exception:
            pass
    return folder / "automod.json"

def load_automod_config(guild_id: int) -> Dict[str, Any]:
    with _automod_lock:
        if guild_id in _automod_cache:
            return _automod_cache[guild_id]
        path = _get_file_path(guild_id)
        try:
            data = get_config("AutoMod", guild_id)
            if not data:
                data = json.loads(json.dumps(DEFAULT_AUTOMOD_CONFIG))
            else:
                for key, val in DEFAULT_AUTOMOD_CONFIG.items():
                    if key not in data:
                        data[key] = val
                    elif isinstance(val, dict) and isinstance(data[key], dict):
                        for subkey, subval in val.items():
                            if subkey not in data[key]:
                                data[key][subkey] = subval
            _automod_cache[guild_id] = data
            return data
        except Exception:
            cfg = json.loads(json.dumps(DEFAULT_AUTOMOD_CONFIG))
            _automod_cache[guild_id] = cfg
            return cfg

def save_automod_config(guild_id: int, config: Dict[str, Any]) -> None:
    with _automod_lock:
        _automod_cache[guild_id] = config
        path = _get_file_path(guild_id)
        if path.exists():
            try:
                os.chmod(path, 0o666)
            except Exception:
                pass
        try:
            if True:
                set_config("AutoMod", guild_id, config)
        except PermissionError:
            try:
                path.unlink(missing_ok=True)
                if True:
                    set_config("AutoMod", guild_id, config)
            except Exception as e:
                print(f"[AUTOMOD STORAGE ERROR] Permission denied saving {path}: {e}")
                raise e

