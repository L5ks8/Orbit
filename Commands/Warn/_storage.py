import random
import string
import time
from typing import Dict, Any, List
from Database.mongo import get_config, save_config

async def load_warnings(guild_id: int) -> Dict[str, List[Dict[str, Any]]]:
    doc = await get_config(guild_id, "warnings")
    # doc contains "_id" and then user_ids as keys
    # return everything except _id
    return {k: v for k, v in doc.items() if k != "_id"}

async def save_warnings(guild_id: int, data: Dict[str, List[Dict[str, Any]]]) -> None:
    await save_config(guild_id, "warnings", data)

def _generate_warn_id(existing_ids: set) -> str:
    while True:
        wid = "W-" + "".join(random.choices(string.digits, k=4))
        if wid not in existing_ids:
            return wid

async def add_warning(guild_id: int, user_id: int, reason: str, moderator_id: int) -> Dict[str, Any]:
    data = await load_warnings(guild_id)
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
    await save_warnings(guild_id, data)
    return warn_entry

async def get_user_warnings(guild_id: int, user_id: int) -> List[Dict[str, Any]]:
    data = await load_warnings(guild_id)
    return data.get(str(user_id), [])

async def delete_warning(guild_id: int, user_id: int, warn_id: str) -> bool:
    data = await load_warnings(guild_id)
    uid_str = str(user_id)
    if uid_str not in data:
        return False

    clean_wid = warn_id.strip().upper()
    if not clean_wid.startswith("W-"):
        clean_wid = f"W-{clean_wid}"

    original_len = len(data[uid_str])
    data[uid_str] = [w for w in data[uid_str] if w["warn_id"] != clean_wid]

    if len(data[uid_str]) != original_len:
        await save_warnings(guild_id, data)
        return True
    return False

async def clear_user_warnings(guild_id: int, user_id: int) -> int:
    data = await load_warnings(guild_id)
    uid_str = str(user_id)
    if uid_str not in data or not data[uid_str]:
        return 0

    count = len(data[uid_str])
    data[uid_str] = []
    await save_warnings(guild_id, data)
    return count
