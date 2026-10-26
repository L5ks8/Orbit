from Components.Database.mongodb import get_config, set_config
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
    try:
        data = get_config("Warn", guild_id)
        if not isinstance(data, dict):
            return {}
        clean_data: Dict[str, List[Dict[str, Any]]] = {}
        for uid, warns in data.items():
            uid_str = str(uid)
            if uid_str in ("_id", "guild_id") or not uid_str.isdigit():
                continue
            if isinstance(warns, list):
                seen = set()
                new_warns = []
                for w in warns:
                    if isinstance(w, dict):
                        wid = w.get("warn_id")
                        if wid and wid not in seen:
                            seen.add(wid)
                            new_warns.append(w)
                clean_data[uid_str] = new_warns
        return clean_data
    except Exception:
        return {}

def save_warnings(guild_id: int, data: Dict[str, List[Dict[str, Any]]]) -> None:
    path = _get_file_path(guild_id)
    clean_data = {
        str(k): [w for w in v if isinstance(w, dict)]
        for k, v in data.items()
        if str(k).isdigit() and isinstance(v, list)
    }
    set_config("Warn", guild_id, clean_data)

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

    existing_ids = {
        w["warn_id"]
        for user_warns in data.values()
        if isinstance(user_warns, list)
        for w in user_warns
        if isinstance(w, dict) and "warn_id" in w
    }
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
    raw = data.get(str(user_id), [])
    if isinstance(raw, list):
        return [w for w in raw if isinstance(w, dict)]
    return []

def delete_warning(guild_id: int, user_id: int, warn_id: str) -> bool:
    data = load_warnings(guild_id)
    uid_str = str(user_id)
    if uid_str not in data or not isinstance(data[uid_str], list):
        return False

    clean_wid = warn_id.strip().upper()
    if not clean_wid.startswith("W-"):
        clean_wid = f"W-{clean_wid}"

    original_len = len(data[uid_str])
    data[uid_str] = [w for w in data[uid_str] if isinstance(w, dict) and w.get("warn_id") != clean_wid]

    if len(data[uid_str]) != original_len:
        save_warnings(guild_id, data)
        return True
    return False

def clear_user_warnings(guild_id: int, user_id: int) -> int:
    data = load_warnings(guild_id)
    uid_str = str(user_id)
    if uid_str not in data or not isinstance(data[uid_str], list):
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
    try:
        history = get_config("WarnHistory", guild_id)
        if not history or not isinstance(history, dict):
            history = get_config("Warn", guild_id)
        if not isinstance(history, dict):
            return {}
        clean_history: Dict[str, List[Dict[str, Any]]] = {}
        for uid, warns in history.items():
            uid_str = str(uid)
            if uid_str in ("_id", "guild_id") or not uid_str.isdigit():
                continue
            if isinstance(warns, list):
                seen = set()
                new_warns = []
                for w in warns:
                    if isinstance(w, dict):
                        wid = w.get("warn_id")
                        if wid and wid not in seen:
                            seen.add(wid)
                            new_warns.append(w)
                clean_history[uid_str] = new_warns
        return clean_history
    except Exception:
        return {}

def save_warn_history(guild_id: int, data: Dict[str, List[Dict[str, Any]]]) -> None:
    path = _get_history_file_path(guild_id)
    clean_data = {
        str(k): [w for w in v if isinstance(w, dict)]
        for k, v in data.items()
        if str(k).isdigit() and isinstance(v, list)
    }
    set_config("WarnHistory", guild_id, clean_data)

def add_to_warn_history(guild_id: int, user_id: int, warn_entry: Dict[str, Any]) -> None:
    data = load_warn_history(guild_id)
    uid_str = str(user_id)
    if uid_str not in data:
        data[uid_str] = []
    data[uid_str].append(warn_entry)
    save_warn_history(guild_id, data)

def get_warn_history(guild_id: int, user_id: int) -> List[Dict[str, Any]]:
    data = load_warn_history(guild_id)
    raw = data.get(str(user_id), [])
    if isinstance(raw, list):
        return [w for w in raw if isinstance(w, dict)]
    return []

