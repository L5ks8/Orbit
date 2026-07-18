import json
import pathlib
import threading
from typing import Dict, Any

STORAGE_ROOT = pathlib.Path("Storage")
_blacklist_cache: Dict[int, Dict[str, Dict[str, Any]]] = {}
_blacklist_lock = threading.Lock()

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "blacklist.json"

def load_blacklist(guild_id: int) -> Dict[str, Dict[str, Any]]:
    with _blacklist_lock:
        if guild_id in _blacklist_cache:
            return _blacklist_cache[guild_id]
        path = _get_file_path(guild_id)
        if not path.exists():
            _blacklist_cache[guild_id] = {}
            return _blacklist_cache[guild_id]
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                _blacklist_cache[guild_id] = data
                return data
        except Exception:
            _blacklist_cache[guild_id] = {}
            return _blacklist_cache[guild_id]

def save_blacklist(guild_id: int, data: Dict[str, Dict[str, Any]]) -> None:
    with _blacklist_lock:
        _blacklist_cache[guild_id] = data
        path = _get_file_path(guild_id)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)

def add_to_blacklist(guild_id: int, user_id: int, reason: str, added_by: int) -> bool:
    data = load_blacklist(guild_id)
    uid_str = str(user_id)
    if uid_str in data:
        return False
    data[uid_str] = {
        "reason": reason or "No reason provided",
        "added_by": added_by
    }
    save_blacklist(guild_id, data)
    return True

def remove_from_blacklist(guild_id: int, user_id: int) -> bool:
    data = load_blacklist(guild_id)
    uid_str = str(user_id)
    if uid_str not in data:
        return False
    del data[uid_str]
    save_blacklist(guild_id, data)
    return True

def is_blacklisted(guild_id: int, user_id: int) -> bool:
    data = load_blacklist(guild_id)
    return str(user_id) in data

