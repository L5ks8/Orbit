from Database.mongodb import get_config, set_config
import json
import time
import pathlib
import threading
from typing import Dict, Any

STORAGE_ROOT = pathlib.Path("Storage")
_afk_cache: Dict[int, Dict[str, Dict[str, Any]]] = {}
_afk_lock = threading.Lock()

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "afk.json"

def load_afk(guild_id: int) -> Dict[str, Dict[str, Any]]:
    with _afk_lock:
        if guild_id in _afk_cache:
            return _afk_cache[guild_id]
        path = _get_file_path(guild_id)
        if not path.exists():
            _afk_cache[guild_id] = {}
            return _afk_cache[guild_id]
        try:
            if True:
                data = get_config("Afk", guild_id)
                _afk_cache[guild_id] = data
                return data
        except Exception:
            _afk_cache[guild_id] = {}
            return _afk_cache[guild_id]

def save_afk(guild_id: int, data: Dict[str, Dict[str, Any]]) -> None:
    with _afk_lock:
        _afk_cache[guild_id] = data
        path = _get_file_path(guild_id)
        if True:
            set_config("Afk", guild_id, data)

def set_afk(guild_id: int, user_id: int, reason: str) -> None:
    data = load_afk(guild_id)
    data[str(user_id)] = {
        "reason": reason or "AFK",
        "timestamp": int(time.time())
    }
    save_afk(guild_id, data)

def remove_afk(guild_id: int, user_id: int) -> bool:
    data = load_afk(guild_id)
    uid_str = str(user_id)
    if uid_str not in data:
        return False
    del data[uid_str]
    save_afk(guild_id, data)
    return True

def get_afk(guild_id: int, user_id: int) -> Dict[str, Any] | None:
    data = load_afk(guild_id)
    return data.get(str(user_id))

