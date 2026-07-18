import json
import pathlib
from typing import Dict, Any

STORAGE_ROOT = pathlib.Path("Storage")

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "vcban.json"

def load_vcban(guild_id: int) -> Dict[str, Dict[str, Any]]:
    path = _get_file_path(guild_id)
    if not path.exists():
        return {}
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_vcban(guild_id: int, data: Dict[str, Dict[str, Any]]) -> None:
    path = _get_file_path(guild_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

def add_to_vcban(guild_id: int, user_id: int, reason: str, added_by: int) -> bool:
    data = load_vcban(guild_id)
    uid_str = str(user_id)
    if uid_str in data:
        return False
    data[uid_str] = {
        "reason": reason or "No reason provided",
        "added_by": added_by
    }
    save_vcban(guild_id, data)
    return True

def remove_from_vcban(guild_id: int, user_id: int) -> bool:
    data = load_vcban(guild_id)
    uid_str = str(user_id)
    if uid_str not in data:
        return False
    del data[uid_str]
    save_vcban(guild_id, data)
    return True

def is_vcbanned(guild_id: int, user_id: int) -> bool:
    data = load_vcban(guild_id)
    return str(user_id) in data

