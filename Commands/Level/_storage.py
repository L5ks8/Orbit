from Database.mongodb import get_config, set_config, get_db
import math
import threading
from typing import Dict, Any, List, Optional

_level_config_cache: Dict[int, Dict[str, Any]] = {}
_level_lock = threading.Lock()

# ─── Default Config ───────────────────────────────────────────────────────────
DEFAULT_LEVEL_CONFIG = {
    "enabled": False,
    # Message XP
    "msg_xp_enabled": True,
    "msg_xp_amount": 20,
    "msg_xp_cooldown": 60,
    # Voice XP
    "voice_xp_enabled": False,
    "voice_xp_amount": 6,
    "voice_xp_ignore_muted": True,
    "voice_xp_ignore_solo": False,
    # Command XP
    "cmd_xp_enabled": True,
    "cmd_xp_amount": 15,
    "cmd_xp_cooldown": 60,
    # Reaction XP
    "react_xp_enabled": True,
    "react_xp_amount": 15,
    "react_xp_cooldown": 300,
    # XP Options
    "reset_on_leave": False,
    "reset_on_ban": False,
    "vote_boost": True,
    "xp_multiplier": 1.0,
    # Channels / Roles
    "blocked_channels": [],
    "blocked_roles": [],
    "channel_mode": "blacklist",  # "blacklist" or "whitelist"
    "role_mode": "blacklist",
    "levelup_channel": "current",  # "current" or a channel ID
    # Leaderboard
    "leaderboard_url": "",
    "leaderboard_channel": "",
    "leaderboard_color": "#3B82F6",
    # Level Up Message
    "levelup_message_content": "",
    "levelup_embed_author": "",
    "levelup_embed_title": "",
    "levelup_embed_description": "",
    "levelup_embed_footer": "",
    "levelup_embed_image": "",
    "levelup_show_avatar": True,
    "levelup_conditional": "",
    # Level Roles
    "level_roles_stack": False,
    "level_roles_rejoin": False,
    "level_roles": [],  # [{"level": 5, "role_id": "123"}]
    # Stat Roles
    "stat_roles_msg_stack": False,
    "stat_roles_msg_cooldown": 5,
    "stat_roles_msg": [],  # [{"count": 100, "role_id": "123"}]
    "stat_roles_voice_stack": False,
    "stat_roles_voice_cooldown": 5,
    "stat_roles_voice": [],
    "stat_roles_react_stack": False,
    "stat_roles_react_cooldown": 5,
    "stat_roles_react": [],
    # Boosters
    "role_boosters_stack": True,
    "role_boosters": [],  # [{"multiplier": 2.0, "role_id": "123"}]
    "channel_boosters": [],  # [{"multiplier": 2.0, "channel_id": "123"}]
}

# ─── XP / Level Math ──────────────────────────────────────────────────────────
def xp_for_level(level: int) -> int:
    if level <= 0:
        return 0
    return 5 * (level ** 2) + (50 * level) + 100

def total_xp_for_level(level: int) -> int:
    total = 0
    for lvl in range(1, level + 1):
        total += xp_for_level(lvl)
    return total

def level_from_xp(total_xp: int) -> int:
    level = 0
    remaining = total_xp
    while True:
        needed = xp_for_level(level + 1)
        if remaining < needed:
            break
        remaining -= needed
        level += 1
    return level

def xp_progress(total_xp: int) -> tuple:
    level = 0
    remaining = total_xp
    while True:
        needed = xp_for_level(level + 1)
        if remaining < needed:
            break
        remaining -= needed
        level += 1
    return level, remaining, xp_for_level(level + 1)

# ─── Config ───────────────────────────────────────────────────────────────────
def load_level_config(guild_id: int) -> Dict[str, Any]:
    with _level_lock:
        if guild_id in _level_config_cache:
            return _level_config_cache[guild_id]
    try:
        data = get_config("LevelConfig", guild_id, DEFAULT_LEVEL_CONFIG.copy())
        with _level_lock:
            _level_config_cache[guild_id] = data
        return data
    except Exception:
        cfg = DEFAULT_LEVEL_CONFIG.copy()
        with _level_lock:
            _level_config_cache[guild_id] = cfg
        return cfg

def save_level_config(guild_id: int, config: Dict[str, Any]) -> None:
    with _level_lock:
        _level_config_cache[guild_id] = config
    set_config("LevelConfig", guild_id, config)

# ─── User XP Data ─────────────────────────────────────────────────────────────
def get_user_xp(guild_id: int, user_id: int) -> Dict[str, Any]:
    db = get_db()
    col = db["LevelData"]
    doc = col.find_one({"_id": f"{guild_id}_{user_id}"})
    if not doc:
        return {
            "guild_id": guild_id,
            "user_id": user_id,
            "total_xp": 0,
            "message_count": 0,
            "voice_minutes": 0,
            "reaction_count": 0,
        }
    doc.pop("_id", None)
    return doc

def set_user_xp(guild_id: int, user_id: int, data: Dict[str, Any]) -> None:
    db = get_db()
    col = db["LevelData"]
    doc = data.copy()
    doc["_id"] = f"{guild_id}_{user_id}"
    doc["guild_id"] = guild_id
    doc["user_id"] = user_id
    col.replace_one({"_id": doc["_id"]}, doc, upsert=True)

def add_xp(guild_id: int, user_id: int, amount: int) -> tuple:
    data = get_user_xp(guild_id, user_id)
    old_xp = data.get("total_xp", 0)
    old_level = level_from_xp(old_xp)
    new_xp = old_xp + amount
    data["total_xp"] = new_xp
    new_level = level_from_xp(new_xp)
    set_user_xp(guild_id, user_id, data)
    return old_level, new_level, new_xp

def increment_stat(guild_id: int, user_id: int, stat: str, amount: int = 1) -> int:
    data = get_user_xp(guild_id, user_id)
    data[stat] = data.get(stat, 0) + amount
    set_user_xp(guild_id, user_id, data)
    return data[stat]

def get_leaderboard(guild_id: int, limit: int = 10) -> List[Dict[str, Any]]:
    db = get_db()
    col = db["LevelData"]
    cursor = col.find(
        {"guild_id": guild_id}
    ).sort("total_xp", -1).limit(limit)
    results = []
    for doc in cursor:
        doc.pop("_id", None)
        results.append(doc)
    return results

def get_user_rank(guild_id: int, user_id: int) -> int:
    db = get_db()
    col = db["LevelData"]
    user_data = get_user_xp(guild_id, user_id)
    user_xp = user_data.get("total_xp", 0)
    count = col.count_documents({"guild_id": guild_id, "total_xp": {"$gt": user_xp}})
    return count + 1

def delete_user_xp(guild_id: int, user_id: int) -> None:
    db = get_db()
    col = db["LevelData"]
    col.delete_one({"_id": f"{guild_id}_{user_id}"})
