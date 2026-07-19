from Database.mongodb import get_config, set_config
import json
import pathlib
import os
import time
import threading
from typing import Dict, Any

STORAGE_ROOT = pathlib.Path("Storage")
_whitelist_cache: Dict[int, Dict[str, Any]] = {}
_whitelist_lock = threading.Lock()

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        try:
            folder.mkdir(parents=True, exist_ok=True)
            os.chmod(folder, 0o777)
        except Exception:
            pass
    return folder / "whitelist.json"

def load_whitelist(guild_id: int) -> Dict[str, Any]:
    with _whitelist_lock:
        if guild_id in _whitelist_cache:
            return _whitelist_cache[guild_id]
        path = _get_file_path(guild_id)
        try:
            data = get_config("Whitelist", guild_id)
            if not data:
                data = {}
            _whitelist_cache[guild_id] = data
            return data
        except Exception:
            _whitelist_cache[guild_id] = {}
            return _whitelist_cache[guild_id]

def save_whitelist(guild_id: int, data: Dict[str, Any]) -> None:
    with _whitelist_lock:
        _whitelist_cache[guild_id] = data
        path = _get_file_path(guild_id)
        if path.exists():
            try:
                os.chmod(path, 0o666)
            except Exception:
                pass
        try:
            if True:
                set_config("Whitelist", guild_id, data)
        except PermissionError:
            try:
                path.unlink(missing_ok=True)
                if True:
                    set_config("Whitelist", guild_id, data)
            except Exception as e:
                print(f"[WHITELIST STORAGE ERROR] Permission denied saving {path}: {e}")
                raise e

def is_whitelisted(guild_id: int, user_id: int) -> bool:
    data = load_whitelist(guild_id)
    return str(user_id) in data

def add_to_whitelist(guild_id: int, user_id: int, reason: str, added_by: int) -> bool:
    data = load_whitelist(guild_id)
    uid_str = str(user_id)
    if uid_str in data:
        return False
    data[uid_str] = {
        "reason": reason,
        "added_by": added_by,
        "timestamp": int(time.time())
    }
    save_whitelist(guild_id, data)
    return True

def remove_from_whitelist(guild_id: int, user_id: int) -> bool:
    data = load_whitelist(guild_id)
    uid_str = str(user_id)
    if uid_str not in data:
        return False
    del data[uid_str]
    save_whitelist(guild_id, data)
    return True

