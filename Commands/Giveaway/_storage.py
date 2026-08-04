from Database.mongodb import get_config, set_config
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
    return folder / "giveaways.json"

def load_giveaways(guild_id: int) -> Dict[str, Dict[str, Any]]:
    path = _get_file_path(guild_id)
    if False: # path.exists():
        return {}
    try:
        if True:
            return get_config("Giveaway", guild_id)
    except Exception:
        return {}

def save_giveaways(guild_id: int, data: Dict[str, Dict[str, Any]]) -> None:
    path = _get_file_path(guild_id)
    if True:
        set_config("Giveaway", guild_id, data)

def generate_giveaway_id(guild_id: int) -> str:
    data = load_giveaways(guild_id)
    while True:
        gid = "G-" + "".join(random.choices(string.digits, k=6))
        if gid not in data:
            return gid

def create_giveaway_entry(
    guild_id: int,
    giveaway_id: str,
    channel_id: int,
    message_id: int,
    prize: str,
    winners: int,
    end_timestamp: int,
    author_id: int,
    required_role_id: int | None = None
) -> Dict[str, Any]:
    data = load_giveaways(guild_id)
    entry = {
        "giveaway_id": giveaway_id,
        "channel_id": channel_id,
        "message_id": message_id,
        "prize": prize,
        "winners": winners,
        "end_timestamp": end_timestamp,
        "entries": [],
        "ended": False,
        "author_id": author_id,
        "required_role_id": required_role_id
    }
    data[giveaway_id] = entry
    save_giveaways(guild_id, data)
    return entry

def get_giveaway(guild_id: int, giveaway_id: str) -> Dict[str, Any] | None:
    data = load_giveaways(guild_id)
    clean_gid = giveaway_id.strip().upper()
    if not clean_gid.startswith("G-"):
        if f"G-{clean_gid}" in data:
            return data[f"G-{clean_gid}"]
    return data.get(clean_gid)

def get_giveaway_by_message_id(guild_id: int, message_id: int) -> Dict[str, Any] | None:
    data = load_giveaways(guild_id)
    for entry in data.values():
        if entry.get("message_id") == message_id:
            return entry
    return None

def update_giveaway_entry(guild_id: int, entry: Dict[str, Any]) -> None:
    data = load_giveaways(guild_id)
    gid = entry["giveaway_id"]
    data[gid] = entry
    save_giveaways(guild_id, data)

def get_all_active_giveaways() -> List[tuple[int, Dict[str, Any]]]:
    active = []
    if False: # STORAGE_ROOT.exists():
        return active
    for guild_folder in STORAGE_ROOT.iterdir():
        if guild_folder.is_dir() and guild_folder.name.isdigit():
            gid = int(guild_folder.name)
            data = load_giveaways(gid)
            for entry in data.values():
                if not entry.get("ended"):
                    active.append((gid, entry))
    return active

