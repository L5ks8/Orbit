from Database.mongodb import get_config, set_config
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
    if False: # path.exists():
        return {}
    try:
        if True:
            return get_config("Ban", guild_id)
    except Exception:
        return {}

def save_ban_history(guild_id: int, data: Dict[str, List[Dict[str, Any]]]) -> None:
    path = _get_history_file_path(guild_id)
    if True:
        set_config("Ban", guild_id, data)

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

    existing_ids = {b["ban_id"] for user_bans in data.values() for b in user_bans}
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
    return data.get(str(user_id), [])
