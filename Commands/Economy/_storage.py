from Database.mongodb import get_config, set_config, get_db
import time
import random
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
    # Work Command Options
    "work_enabled": True,
    "work_min_amount": 300,
    "work_max_amount": 500,
    "work_cooldown_min": 240,  # minutes
    "work_use_default_responses": True,
    "work_custom_responses": [],
    # Daily Command Options
    "daily_base_reward_enabled": True,
    "daily_base_reward": 250,
    "daily_tier_reward_enabled": True,
    "daily_streak_limit": 5,
    "daily_streak_bonus": 50,
    "daily_over_limit_bonus": 10,
    # Money Leaderboard (Geld Top)
    "baltop_custom_url": "",
    "baltop_auto_channel_id": None,
    "baltop_embed_color": "#5865F2",
    "baltop_message_id": None,
    # Items, Chests, Rarities, Recipes
    "items": [],
    "chests": [],
    "rarities": [
        {"id": "common", "name": "Common", "color": "#7289DA", "weight": 9},
        {"id": "legendary", "name": "Legendary", "color": "#FEE75C", "weight": 1}
    ],
    "recipes": [],
    # Boosters
    "role_boosters_stack": True,
    "role_boosters": [],
    "channel_boosters": []
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

# ─── User Balance & Inventory Data ──────────────────────────────────────────────
def get_user_economy(guild_id: int, user_id: int) -> Dict[str, Any]:
    db = get_db()
    if db is None:
        return {
            "guild_id": guild_id, "user_id": user_id, "balance": 0,
            "last_daily": 0, "daily_streak": 0, "last_work": 0, "inventory": []
        }
    col = db["EconomyData"]
    doc = col.find_one({"_id": f"{guild_id}_{user_id}"})
    if not doc:
        return {
            "guild_id": guild_id,
            "user_id": user_id,
            "balance": 0,
            "last_daily": 0,
            "daily_streak": 0,
            "last_work": 0,
            "inventory": []
        }
    doc.pop("_id", None)
    if "inventory" not in doc:
        doc["inventory"] = []
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

# ─── Work Command ─────────────────────────────────────────────────────────────
def claim_work(guild_id: int, user_id: int) -> tuple:
    """
    Claims the work reward for a user.
    Returns (success, reward_amount, response_template, cooldown_remaining_seconds)
    """
    config = load_economy_config(guild_id)
    if not config.get("enabled", True) or not config.get("work_enabled", True):
        return False, 0, "Work command disabled", 0

    data = get_user_economy(guild_id, user_id)
    now = int(time.time())
    last_work = data.get("last_work", 0)
    cooldown_sec = int(config.get("work_cooldown_min", 240)) * 60

    elapsed = now - last_work
    if elapsed < cooldown_sec:
        return False, 0, "", cooldown_sec - elapsed

    min_pay = config.get("work_min_amount", 300)
    max_pay = config.get("work_max_amount", 500)
    if min_pay > max_pay:
        min_pay, max_pay = max_pay, min_pay

    base_pay = random.randint(min_pay, max_pay)
    mult = config.get("money_multiplier", 1.0)
    reward_amount = int(base_pay * mult)

    responses = []
    if config.get("work_use_default_responses", True):
        responses.extend([
            "You worked as a Software Engineer and earned {symbol} {amount:,}!",
            "You worked a shift at the Local Coffee Shop and earned {symbol} {amount:,}!",
            "You completed a freelance Graphic Design project and earned {symbol} {amount:,}!",
            "You delivered food orders around town and earned {symbol} {amount:,}!",
            "You streamed video games online and earned {symbol} {amount:,} in tips!",
            "You fixed computers for neighbors and earned {symbol} {amount:,}!"
        ])

    custom_resp = config.get("work_custom_responses", [])
    if custom_resp:
        responses.extend(custom_resp)

    if not responses:
        responses = ["You worked hard and earned {symbol} {amount:,}!"]

    template = random.choice(responses)

    data["balance"] = data.get("balance", 0) + reward_amount
    data["last_work"] = now
    set_user_economy(guild_id, user_id, data)

    return True, reward_amount, template, 0

# ─── Daily Command ─────────────────────────────────────────────────────────────
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

    if elapsed <= 172800:
        new_streak = current_streak + 1
    else:
        new_streak = 1

    base_enabled = config.get("daily_base_reward_enabled", True)
    base_reward = config.get("daily_base_reward", 250) if base_enabled else 0
    tier_enabled = config.get("daily_tier_reward_enabled", True)
    streak_limit = config.get("daily_streak_limit", 5)
    streak_bonus = config.get("daily_streak_bonus", 50)
    over_limit_bonus = config.get("daily_over_limit_bonus", 10)
    mult = config.get("money_multiplier", 1.0)

    if tier_enabled:
        if new_streak <= streak_limit:
            bonus = new_streak * streak_bonus
        else:
            bonus = (streak_limit * streak_bonus) + ((new_streak - streak_limit) * over_limit_bonus)
    else:
        w_min = config.get("work_min_amount", 300)
        w_max = config.get("work_max_amount", 500)
        bonus = int((w_min + w_max) * 0.8)

    reward_amount = int((base_reward + bonus) * mult)

    data["balance"] = data.get("balance", 0) + reward_amount
    data["last_daily"] = now
    data["daily_streak"] = new_streak
    set_user_economy(guild_id, user_id, data)

    return True, reward_amount, new_streak, 0

# ─── Leaderboard ─────────────────────────────────────────────────────────────
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
