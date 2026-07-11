import json
import pathlib
import threading
from typing import Dict, Any

STORAGE_ROOT = pathlib.Path("Storage")
_jtc_config_cache: Dict[int, Dict[str, Any]] = {}
_jtc_channels_cache: Dict[int, Dict[str, Dict[str, Any]]] = {}
_jtc_lock = threading.Lock()

def _get_config_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "jtc_config.json"

def _get_channels_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "jtc_channels.json"

def load_jtc_config(guild_id: int) -> Dict[str, Any]:
    with _jtc_lock:
        if guild_id in _jtc_config_cache:
            return _jtc_config_cache[guild_id]
        path = _get_config_path(guild_id)
        if not path.exists():
            default_cfg = {
                "enabled": False,
                "hub_channel_id": None,
                "category_id": None,
                "default_user_limit": 0
            }
            _jtc_config_cache[guild_id] = default_cfg
            return default_cfg
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                _jtc_config_cache[guild_id] = data
                return data
        except Exception:
            default_cfg = {
                "enabled": False,
                "hub_channel_id": None,
                "category_id": None,
                "default_user_limit": 0
            }
            _jtc_config_cache[guild_id] = default_cfg
            return default_cfg

def save_jtc_config(guild_id: int, data: Dict[str, Any]) -> None:
    with _jtc_lock:
        _jtc_config_cache[guild_id] = data
        path = _get_config_path(guild_id)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)

def load_active_channels(guild_id: int) -> Dict[str, Dict[str, Any]]:
    with _jtc_lock:
        if guild_id in _jtc_channels_cache:
            return _jtc_channels_cache[guild_id]
        path = _get_channels_path(guild_id)
        if not path.exists():
            _jtc_channels_cache[guild_id] = {}
            return _jtc_channels_cache[guild_id]
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                _jtc_channels_cache[guild_id] = data
                return data
        except Exception:
            _jtc_channels_cache[guild_id] = {}
            return _jtc_channels_cache[guild_id]

def save_active_channels(guild_id: int, data: Dict[str, Dict[str, Any]]) -> None:
    with _jtc_lock:
        _jtc_channels_cache[guild_id] = data
        path = _get_channels_path(guild_id)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)

def get_active_channel(guild_id: int, channel_id: int) -> Dict[str, Any] | None:
    data = load_active_channels(guild_id)
    return data.get(str(channel_id))

def create_active_channel(guild_id: int, channel_id: int, owner_id: int, message_id: int = 0) -> Dict[str, Any]:
    data = load_active_channels(guild_id)
    entry = {
        "channel_id": channel_id,
        "owner_id": owner_id,
        "locked": False,
        "hidden": False,
        "limit": 0,
        "trusted_users": [],
        "message_id": message_id
    }
    data[str(channel_id)] = entry
    save_active_channels(guild_id, data)
    return entry

def update_active_channel(guild_id: int, channel_id: int, entry: Dict[str, Any]) -> None:
    data = load_active_channels(guild_id)
    data[str(channel_id)] = entry
    save_active_channels(guild_id, data)

def remove_active_channel(guild_id: int, channel_id: int) -> None:
    data = load_active_channels(guild_id)
    ch_str = str(channel_id)
    if ch_str in data:
        del data[ch_str]
        save_active_channels(guild_id, data)
