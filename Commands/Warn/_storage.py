import json
import pathlib
import random
import string
import time
from typing import Dict, Any, List

STORAGE_ROOT = pathlib.Path("Storage")

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "warnings.json"

def load_warnings(guild_id: int) -> Dict[str, List[Dict[str, Any]]]:
    path = _get_file_path(guild_id)
    if not path.exists():
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_warnings(guild_id: int, data: Dict[str, List[Dict[str, Any]]]) -> None:
    path = _get_file_path(guild_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

def _generate_warn_id(existing_ids: set) -> str:
    while True:
        wid = "W-" + "".join(random.choices(string.digits, k=4))
        if wid not in existing_ids:
            return wid

def add_warning(guild_id: int, user_id: int, reason: str, moderator_id: int) -> Dict[str, Any]:
    data = load_warnings(guild_id)
    uid_str = str(user_id)
    if uid_str not in data:
        data[uid_str] = []

    existing_ids = {w["warn_id"] for user_warns in data.values() for w in user_warns}
    warn_id = _generate_warn_id(existing_ids)

    warn_entry = {
        "warn_id": warn_id,
        "reason": reason,
        "moderator_id": moderator_id,
        "timestamp": int(time.time())
    }
    data[uid_str].append(warn_entry)
    save_warnings(guild_id, data)
    add_to_warn_history(guild_id, user_id, warn_entry)
    return warn_entry

def get_user_warnings(guild_id: int, user_id: int) -> List[Dict[str, Any]]:
    data = load_warnings(guild_id)
    return data.get(str(user_id), [])

def delete_warning(guild_id: int, user_id: int, warn_id: str) -> bool:
    data = load_warnings(guild_id)
    uid_str = str(user_id)
    if uid_str not in data:
        return False

    clean_wid = warn_id.strip().upper()
    if not clean_wid.startswith("W-"):
        clean_wid = f"W-{clean_wid}"

    original_len = len(data[uid_str])
    data[uid_str] = [w for w in data[uid_str] if w["warn_id"] != clean_wid]

    if len(data[uid_str]) != original_len:
        save_warnings(guild_id, data)
        return True
    return False

def clear_user_warnings(guild_id: int, user_id: int) -> int:
    data = load_warnings(guild_id)
    uid_str = str(user_id)
    if uid_str not in data or not data[uid_str]:
        return 0

    count = len(data[uid_str])
    data[uid_str] = []
    save_warnings(guild_id, data)
    return count

def _get_history_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "warn_history.json"

def load_warn_history(guild_id: int) -> Dict[str, List[Dict[str, Any]]]:
    path = _get_history_file_path(guild_id)
    if not path.exists():
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_warn_history(guild_id: int, data: Dict[str, List[Dict[str, Any]]]) -> None:
    path = _get_history_file_path(guild_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

def add_to_warn_history(guild_id: int, user_id: int, warn_entry: Dict[str, Any]) -> None:
    data = load_warn_history(guild_id)
    uid_str = str(user_id)
    if uid_str not in data:
        data[uid_str] = []
    data[uid_str].append(warn_entry)
    save_warn_history(guild_id, data)

def get_warn_history(guild_id: int, user_id: int) -> List[Dict[str, Any]]:
    data = load_warn_history(guild_id)
    return data.get(str(user_id), [])

