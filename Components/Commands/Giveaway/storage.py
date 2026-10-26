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
    return folder / "giveaways.json"

def load_giveaways(guild_id: int) -> Dict[str, Dict[str, Any]]:
    path = _get_file_path(guild_id)
    try:
        raw = get_config("Giveaway", guild_id)
        if isinstance(raw, dict):
            return {str(k): v for k, v in raw.items() if str(k) not in ("_id", "guild_id") and isinstance(v, dict)}
    except Exception:
        return {}
    return {}

def save_giveaways(guild_id: int, data: Dict[str, Dict[str, Any]]) -> None:
    path = _get_file_path(guild_id)
    clean_data = {str(k): v for k, v in data.items() if str(k) not in ("_id", "guild_id") and isinstance(v, dict)}
    set_config("Giveaway", guild_id, clean_data)

def generate_giveaway_id(guild_id: int = None) -> str:
    data = load_giveaways(guild_id) if guild_id else {}
    while True:
        gid = "G-" + "".join(random.choices(string.digits, k=6))
        if gid not in data:
            return gid

def create_giveaway_entry(
    guild_id: int,
    giveaway_id: str,
    channel_id: int,
    prize: str,
    winners: int,
    end_timestamp: int,
    author_id: int,
    message_id: int = 0,
    required_role_id: int | None = None,
    color: int | str | None = None
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
        "required_role_id": required_role_id,
        "color": color or 0x5865F2
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
        if isinstance(entry, dict) and entry.get("message_id") == message_id:
            return entry
    return None

def update_giveaway_entry(guild_id: int, entry: Dict[str, Any]) -> None:
    data = load_giveaways(guild_id)
    gid = entry.get("giveaway_id") or entry.get("id")
    if not gid:
        msg_id = entry.get("message_id")
        for k, v in data.items():
            if msg_id and isinstance(v, dict) and v.get("message_id") == msg_id:
                gid = k
                break
    if not gid:
        return
    entry["giveaway_id"] = gid
    data[gid] = entry
    save_giveaways(guild_id, data)

def delete_giveaway_entry(guild_id: int, giveaway_id: str) -> Dict[str, Any] | None:
    data = load_giveaways(guild_id)
    clean_gid = giveaway_id.strip().upper()
    target_k = None
    if clean_gid in data:
        target_k = clean_gid
    elif not clean_gid.startswith("G-") and f"G-{clean_gid}" in data:
        target_k = f"G-{clean_gid}"
    else:
        for k, v in data.items():
            if k == giveaway_id or (isinstance(v, dict) and v.get("giveaway_id") == giveaway_id):
                target_k = k
                break
    if target_k:
        removed = data.pop(target_k, None)
        save_giveaways(guild_id, data)
        return removed
    return None

def get_all_active_giveaways() -> List[tuple[int, Dict[str, Any]]]:
    seen_giveaways = set()
    active = []
    try:
        from Components.Database.mongodb import get_db
        db = get_db()
        if db is not None:
            col = db["Giveaway"]
            for doc in col.find():
                gid_str = doc.get("_id")
                if gid_str and str(gid_str).isdigit():
                    gid = int(gid_str)
                    for k, v in doc.items():
                        if k != "_id" and isinstance(v, dict) and not v.get("ended"):
                            gw_id = v.get("giveaway_id") or k
                            v["giveaway_id"] = gw_id
                            if gw_id not in seen_giveaways:
                                seen_giveaways.add(gw_id)
                                active.append((gid, v))
    except Exception as e:
        print(f"[GiveawayStorage] Mongo error: {e}")

    try:
        if STORAGE_ROOT.exists():
            for guild_folder in STORAGE_ROOT.iterdir():
                if guild_folder.is_dir() and guild_folder.name.isdigit():
                    gid = int(guild_folder.name)
                    data = load_giveaways(gid)
                    for k, entry in data.items():
                        if isinstance(entry, dict) and not entry.get("ended"):
                            gw_id = entry.get("giveaway_id") or k
                            entry["giveaway_id"] = gw_id
                            if gw_id not in seen_giveaways:
                                seen_giveaways.add(gw_id)
                                active.append((gid, entry))
    except Exception as e:
        print(f"[GiveawayStorage] File error: {e}")

    return active

