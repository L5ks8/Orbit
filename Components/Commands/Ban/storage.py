from Components.Database.mongodb import get_config, set_config
import json
import pathlib
import random
import string
import time
from typing import Dict, Any, List

STORAGE_ROOT = pathlib.Path("Storage")

def _get_history_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "ban_history.json"

def load_ban_history(guild_id: int) -> Dict[str, List[Dict[str, Any]]]:
    path = _get_history_file_path(guild_id)
    try:
        raw = get_config("Ban", guild_id)
        if not isinstance(raw, dict):
            return {}
        clean_data: Dict[str, List[Dict[str, Any]]] = {}
        for uid, bans in raw.items():
            uid_str = str(uid)
            if uid_str in ("_id", "guild_id") or not uid_str.isdigit():
                continue
            if isinstance(bans, list):
                clean_data[uid_str] = [b for b in bans if isinstance(b, dict)]
        return clean_data
    except Exception:
        return {}

def save_ban_history(guild_id: int, data: Dict[str, List[Dict[str, Any]]]) -> None:
    path = _get_history_file_path(guild_id)
    clean_data = {
        str(k): [b for b in v if isinstance(b, dict)]
        for k, v in data.items()
        if str(k).isdigit() and isinstance(v, list)
    }
    set_config("Ban", guild_id, clean_data)

def _generate_ban_id(existing_ids: set) -> str:
    while True:
        bid = "B-" + "".join(random.choices(string.digits, k=4))
        if bid not in existing_ids:
            return bid

def add_ban_history(guild_id: int, user_id: int, reason: str, moderator_id: int) -> Dict[str, Any]:
    data = load_ban_history(guild_id)
    uid_str = str(user_id)
    if uid_str not in data:
        data[uid_str] = []

    existing_ids = {
        b["ban_id"]
        for user_bans in data.values()
        if isinstance(user_bans, list)
        for b in user_bans
        if isinstance(b, dict) and "ban_id" in b
    }
    ban_id = _generate_ban_id(existing_ids)

    ban_entry = {
        "ban_id": ban_id,
        "reason": reason,
        "moderator_id": moderator_id,
        "timestamp": int(time.time())
    }
    data[uid_str].append(ban_entry)
    save_ban_history(guild_id, data)
    return ban_entry

def get_ban_history(guild_id: int, user_id: int) -> List[Dict[str, Any]]:
    data = load_ban_history(guild_id)
    raw = data.get(str(user_id), [])
    if isinstance(raw, list):
        return [b for b in raw if isinstance(b, dict)]
    return []
