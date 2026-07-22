from Database.mongodb import get_config, set_config, get_db
import time
import threading
from typing import Dict, Any, List, Optional

_economy_config_cache: Dict[int, Dict[str, Any]] = {}
_economy_lock = threading.Lock()

# ─── Default Config ───────────────────────────────────────────────────────────
DEFAULT_ECONOMY_CONFIG = {
    "enabled": True,
    # Money Options
    "currency_symbol": "🪙",
    "money_multiplier": 1.0,
    "bet_limit_enabled": True,
    "bet_limit_amount": 10000,
    "reset_on_leave": False,
    # Blacklists / Whitelists
    "blocked_channels": [],
    "blocked_roles": [],
    "channel_mode": "blacklist",  # "blacklist" or "whitelist"
    "role_mode": "blacklist",
    # Message Money
    "msg_money_enabled": True,
    "msg_money_amount": 8,
    "msg_money_cooldown": 60,
    # Voice Money
    "voice_money_enabled": False,
    "voice_money_ignore_muted": True,
    "voice_money_ignore_solo": False,
    "voice_money_amount": 4,
    # Command Money
    "cmd_money_enabled": True,
    "cmd_money_amount": 8,
    "cmd_money_cooldown": 60,
    # Reaction Money
    "react_money_enabled": True,
    "react_money_amount": 20,
    "react_money_cooldown": 300,
    # Daily Command Options
    "daily_base_reward": 250,
    "daily_streak_limit": 5,
    "daily_streak_bonus": 50,
}

# ─── Config ───────────────────────────────────────────────────────────────────
def load_economy_config(guild_id: int) -> Dict[str, Any]:
    with _economy_lock:
        if guild_id in _economy_config_cache:
            return _economy_config_cache[guild_id]
    try:
        data = get_config("EconomyConfig", guild_id, DEFAULT_ECONOMY_CONFIG.copy())
        with _economy_lock:
            _economy_config_cache[guild_id] = data
        return data
    except Exception:
        cfg = DEFAULT_ECONOMY_CONFIG.copy()
        with _economy_lock:
            _economy_config_cache[guild_id] = cfg
        return cfg

def save_economy_config(guild_id: int, config: Dict[str, Any]) -> None:
    with _economy_lock:
        _economy_config_cache[guild_id] = config
    set_config("EconomyConfig", guild_id, config)

# ─── User Balance Data ────────────────────────────────────────────────────────
def get_user_economy(guild_id: int, user_id: int) -> Dict[str, Any]:
    db = get_db()
    if db is None:
        return {"guild_id": guild_id, "user_id": user_id, "balance": 0, "last_daily": 0, "daily_streak": 0}
    col = db["EconomyData"]
    doc = col.find_one({"_id": f"{guild_id}_{user_id}"})
    if not doc:
        return {
            "guild_id": guild_id,
            "user_id": user_id,
            "balance": 0,
            "last_daily": 0,
            "daily_streak": 0
        }
    doc.pop("_id", None)
    return doc

def set_user_economy(guild_id: int, user_id: int, data: Dict[str, Any]) -> None:
    db = get_db()
    if db is None: return
    col = db["EconomyData"]
    doc = data.copy()
    doc["_id"] = f"{guild_id}_{user_id}"
    doc["guild_id"] = guild_id
    doc["user_id"] = user_id
    col.replace_one({"_id": doc["_id"]}, doc, upsert=True)

def get_user_balance(guild_id: int, user_id: int) -> int:
    data = get_user_economy(guild_id, user_id)
    return data.get("balance", 0)

def set_user_balance(guild_id: int, user_id: int, amount: int) -> int:
    data = get_user_economy(guild_id, user_id)
    data["balance"] = max(0, amount)
    set_user_economy(guild_id, user_id, data)
    return data["balance"]

def add_user_balance(guild_id: int, user_id: int, amount: int) -> int:
    if amount == 0:
        return get_user_balance(guild_id, user_id)
    data = get_user_economy(guild_id, user_id)
    new_bal = max(0, data.get("balance", 0) + amount)
    data["balance"] = new_bal
    set_user_economy(guild_id, user_id, data)
    return new_bal

def remove_user_balance(guild_id: int, user_id: int, amount: int) -> tuple:
    if amount <= 0:
        return True, get_user_balance(guild_id, user_id)
    data = get_user_economy(guild_id, user_id)
    curr_bal = data.get("balance", 0)
    if curr_bal < amount:
        return False, curr_bal
    new_bal = curr_bal - amount
    data["balance"] = new_bal
    set_user_economy(guild_id, user_id, data)
    return True, new_bal

def claim_daily(guild_id: int, user_id: int) -> tuple:
    """
    Claims the daily reward for a user.
    Returns (success, reward_amount, current_streak, cooldown_remaining_seconds)
    """
    config = load_economy_config(guild_id)
    data = get_user_economy(guild_id, user_id)
    now = int(time.time())
    last_daily = data.get("last_daily", 0)
    current_streak = data.get("daily_streak", 0)

    cooldown = 86400  # 24 hours
    elapsed = now - last_daily

    if elapsed < cooldown:
        remaining = cooldown - elapsed
        return False, 0, current_streak, remaining

    # Streak logic: if claimed within 48 hours (172800 sec), keep streak going, else reset to 1
    if elapsed <= 172800:
        new_streak = current_streak + 1
    else:
        new_streak = 1

    base_reward = config.get("daily_base_reward", 250)
    streak_limit = config.get("daily_streak_limit", 5)
    streak_bonus = config.get("daily_streak_bonus", 50)
    mult = config.get("money_multiplier", 1.0)

    effective_streak = min(new_streak, streak_limit)
    reward_amount = int((base_reward + (effective_streak * streak_bonus)) * mult)

    data["balance"] = data.get("balance", 0) + reward_amount
    data["last_daily"] = now
    data["daily_streak"] = new_streak
    set_user_economy(guild_id, user_id, data)

    return True, reward_amount, new_streak, 0

def get_economy_leaderboard(guild_id: int, limit: int = 10) -> List[Dict[str, Any]]:
    db = get_db()
    if db is None: return []
    col = db["EconomyData"]
    cursor = col.find({"guild_id": guild_id}).sort("balance", -1).limit(limit)
    results = []
    for doc in cursor:
        doc.pop("_id", None)
        results.append(doc)
    return results

def delete_user_economy(guild_id: int, user_id: int) -> None:
    db = get_db()
    if db is None: return
    col = db["EconomyData"]
    col.delete_one({"_id": f"{guild_id}_{user_id}"})
