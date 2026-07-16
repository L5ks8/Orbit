
from typing import Dict, Any, List, Optional
import time
import random
import string
import discord
from discord.ui import LayoutView, Container, TextDisplay, Separator
from Database.mongo import get_config, save_config, get_all_configs


# --- Warn ---

async def load_warnings(guild_id: int) -> Dict[str, List[Dict[str, Any]]]:
    doc = await get_config(guild_id, "warnings")
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

# --- Verify ---

async def load_verify_config(guild_id: int) -> Dict[str, Any]:
    doc = await get_config(guild_id, "verify")
    default_cfg = {"enabled": False, "channel_id": None, "role_id": None, "remove_role_id": None, "auto_kick_minutes": 0, "pending_kicks": {}}
    
    # Merge defaults for missing keys
    for k, v in default_cfg.items():
        if k not in doc:
            doc[k] = v
            
    if "enabled" not in doc or doc["enabled"] is None:
        doc["enabled"] = bool(doc.get("channel_id") and doc.get("role_id"))
        
    return doc

async def save_verify_config(guild_id: int, config: Dict[str, Any]) -> None:
    await save_config(guild_id, "verify", config)

async def setup_verify_config(guild_id: int, channel_id: int, role_id: int, remove_role_id: Optional[int] = None, auto_kick_minutes: int = 0) -> Dict[str, Any]:
    config = await load_verify_config(guild_id)
    config["enabled"] = True
    config["channel_id"] = channel_id
    config["role_id"] = role_id
    config["remove_role_id"] = remove_role_id
    config["auto_kick_minutes"] = max(0, auto_kick_minutes)
    await save_verify_config(guild_id, config)
    return config

async def toggle_verify_config(guild_id: int) -> Dict[str, Any]:
    config = await load_verify_config(guild_id)
    config["enabled"] = not config.get("enabled", False)
    await save_verify_config(guild_id, config)
    return config

async def reset_verify_config(guild_id: int) -> Dict[str, Any]:
    config = {
        "enabled": False,
        "channel_id": None,
        "role_id": None,
        "remove_role_id": None,
        "auto_kick_minutes": 0,
        "pending_kicks": {}
    }
    await save_verify_config(guild_id, config)
    return config

async def add_pending_kick(guild_id: int, user_id: int, kick_timestamp: float) -> None:
    config = await load_verify_config(guild_id)
    if "pending_kicks" not in config:
        config["pending_kicks"] = {}
    config["pending_kicks"][str(user_id)] = kick_timestamp
    await save_verify_config(guild_id, config)

async def remove_pending_kick(guild_id: int, user_id: int) -> None:
    config = await load_verify_config(guild_id)
    if str(user_id) in config.get("pending_kicks", {}):
        del config["pending_kicks"][str(user_id)]
        await save_verify_config(guild_id, config)

# --- Ticket ---

async def load_ticket_config(guild_id: int) -> Dict[str, Any]:
    doc = await get_config(guild_id, "tickets")
    default_cfg = {
        "enabled": False,
        "panel_channel_id": None,
        "category_id": None,
        "support_role_id": None,
        "log_channel_id": None,
        "panel_title": "Support Ticket Desk",
        "panel_description": "Click the button below to open a direct support channel with our team.",
        "options": [],
        "options_slots": [],
        "ticket_counter": 0,
        "active_tickets": {}
    }
    
    # Merge defaults
    for k, v in default_cfg.items():
        if k not in doc:
            doc[k] = v
            
    if not isinstance(doc.get("options"), list):
        doc["options"] = []
    if not isinstance(doc.get("options_slots"), list):
        doc["options_slots"] = []
    return doc

async def save_ticket_config(guild_id: int, config: Dict[str, Any]) -> None:
    await save_config(guild_id, "tickets", config)

async def setup_ticket_config(
    guild_id: int,
    panel_channel_id: int,
    category_id: Optional[int] = None,
    support_role_id: Optional[int] = None,
    log_channel_id: Optional[int] = None,
    panel_title: str = "Support Ticket Desk",
    panel_description: str = "Click the button below to open a direct support channel with our team.",
    options: Optional[list] = None,
    options_slots: Optional[list] = None
) -> Dict[str, Any]:
    config = await load_ticket_config(guild_id)
    config["enabled"] = True
    config["panel_channel_id"] = panel_channel_id
    config["category_id"] = category_id
    config["support_role_id"] = support_role_id
    config["log_channel_id"] = log_channel_id
    config["panel_title"] = panel_title
    config["panel_description"] = panel_description
    if options is not None and isinstance(options, list):
        config["options"] = options
    if options_slots is not None and isinstance(options_slots, list):
        config["options_slots"] = options_slots
    await save_ticket_config(guild_id, config)
    return config

async def create_active_ticket(guild_id: int, channel_id: int, creator_id: int, subject: str, description: str, category_option: str = "General Support") -> int:
    config = await load_ticket_config(guild_id)
    counter = config.get("ticket_counter", 0) + 1
    config["ticket_counter"] = counter
    config["active_tickets"][str(channel_id)] = {
        "creator_id": creator_id,
        "claimed_by": None,
        "created_at": time.time(),
        "subject": subject,
        "description": description,
        "category_option": category_option,
        "number": counter
    }
    await save_ticket_config(guild_id, config)
    return counter

async def claim_ticket(guild_id: int, channel_id: int, claimer_id: int) -> Optional[Dict[str, Any]]:
    config = await load_ticket_config(guild_id)
    ticket_data = config.get("active_tickets", {}).get(str(channel_id))
    if not ticket_data:
        return None
    ticket_data["claimed_by"] = claimer_id
    config["active_tickets"][str(channel_id)] = ticket_data
    await save_ticket_config(guild_id, config)
    return ticket_data

async def close_active_ticket(guild_id: int, channel_id: int) -> Optional[Dict[str, Any]]:
    config = await load_ticket_config(guild_id)
    ticket_data = config.get("active_tickets", {}).pop(str(channel_id), None)
    if ticket_data:
        await save_ticket_config(guild_id, config)
    return ticket_data

async def reset_ticket_config(guild_id: int) -> Dict[str, Any]:
    default_config = {
        "enabled": False,
        "panel_channel_id": None,
        "category_id": None,
        "support_role_id": None,
        "log_channel_id": None,
        "panel_title": "Support Ticket Desk",
        "panel_description": "Click the button below to open a direct support channel with our team.",
        "options": ["General Support", "Billing & Payments", "Bug Report"],
        "ticket_counter": 0,
        "active_tickets": {}
    }
    await save_ticket_config(guild_id, default_config)
    return default_config

# --- Log ---

DEFAULT_CATEGORIES = {
    "moderation": True,
    "messages": True,
    "members": True,
    "channels": True,
    "roles": True,
    "voice": True
}

async def load_log_config(guild_id: int) -> Dict[str, Any]:
    data = await get_config(guild_id, "logs")
    default = {
        "enabled": False,
        "channel_id": None,
        "categories": DEFAULT_CATEGORIES.copy(),
        "channels": {k: None for k in DEFAULT_CATEGORIES}
    }
    
    if "categories" not in data or not isinstance(data["categories"], dict):
        data["categories"] = DEFAULT_CATEGORIES.copy()
    else:
        for k, v in DEFAULT_CATEGORIES.items():
            if k not in data["categories"]:
                data["categories"][k] = v

    if "channels" not in data or not isinstance(data["channels"], dict):
        data["channels"] = {}
        for k in DEFAULT_CATEGORIES:
            if data["categories"].get(k) and data.get("channel_id"):
                data["channels"][k] = data.get("channel_id")
            else:
                data["channels"][k] = None
    else:
        for k in DEFAULT_CATEGORIES:
            if k not in data["channels"]:
                if data["categories"].get(k) and data.get("channel_id"):
                    data["channels"][k] = data.get("channel_id")
                else:
                    data["channels"][k] = None

    for k, v in default.items():
        if k not in data:
            data[k] = v

    return data

async def save_log_config(guild_id: int, config: Dict[str, Any]) -> None:
    await save_config(guild_id, "logs", config)

async def setup_log(guild_id: int, default_channel_id: int = None, channel_overrides: Dict[str, int] = None) -> Dict[str, Any]:
    config = await load_log_config(guild_id)
    config["enabled"] = True

    if default_channel_id is not None:
        config["channel_id"] = default_channel_id
        for k in DEFAULT_CATEGORIES:
            config["channels"][k] = default_channel_id
            config["categories"][k] = True

    if channel_overrides is not None:
        for cat, ch_id in channel_overrides.items():
            if cat in DEFAULT_CATEGORIES and ch_id is not None:
                config["channels"][cat] = ch_id
                config["categories"][cat] = True
                config["channel_id"] = ch_id

    if any(config["channels"].values()):
        config["enabled"] = True

    await save_log_config(guild_id, config)
    return config

async def toggle_log_category(guild_id: int, category: str) -> Dict[str, Any]:
    config = await load_log_config(guild_id)
    if category.lower() == "all":
        channels_map = config.get("channels", {})
        all_on = config.get("enabled", False) and any(ch is not None for ch in channels_map.values())
        if all_on:
            config["enabled"] = False
            for k in DEFAULT_CATEGORIES:
                config["channels"][k] = None
                config["categories"][k] = False
        else:
            fallback_ch = config.get("channel_id")
            if not fallback_ch:
                for v in channels_map.values():
                    if v is not None:
                        fallback_ch = v
                        break
            config["enabled"] = True
            if fallback_ch:
                for k in DEFAULT_CATEGORIES:
                    config["channels"][k] = fallback_ch
                    config["categories"][k] = True
        await save_log_config(guild_id, config)
        return config

    cat = category.lower()
    if cat in DEFAULT_CATEGORIES:
        current_ch = config["channels"].get(cat)
        if current_ch is not None:
            config["channels"][cat] = None
            config["categories"][cat] = False
        else:
            fallback_ch = config.get("channel_id")
            if not fallback_ch:
                for v in config.get("channels", {}).values():
                    if v is not None:
                        fallback_ch = v
                        break
            if fallback_ch:
                config["channels"][cat] = fallback_ch
                config["categories"][cat] = True
                config["enabled"] = True
        await save_log_config(guild_id, config)
    return config

async def reset_log_config(guild_id: int) -> None:
    config = {
        "enabled": False,
        "channel_id": None,
        "categories": DEFAULT_CATEGORIES.copy(),
        "channels": {k: None for k in DEFAULT_CATEGORIES}
    }
    await save_log_config(guild_id, config)

async def log_event(guild: discord.Guild, category: str, title: str, description: str) -> None:
    if not guild:
        return
    config = await load_log_config(guild.id)
    if not config.get("enabled"):
        return

    target_ch_id = config.get("channels", {}).get(category.lower())
    if not target_ch_id:
        if config.get("categories", {}).get(category.lower()) and config.get("channel_id"):
            target_ch_id = config.get("channel_id")
        else:
            return

    try:
        ch_int = int(target_ch_id)
    except Exception:
        return

    channel = guild.get_channel(ch_int)
    if not channel:
        try:
            channel = await guild.fetch_channel(ch_int)
        except Exception:
            pass

    if not channel or not isinstance(channel, (discord.TextChannel, discord.VoiceChannel, discord.StageChannel, discord.ForumChannel, discord.Thread)):
        return

    container = Container(
        TextDisplay(content=f"### {title}"),
        Separator(spacing=discord.SeparatorSpacing.small),
        TextDisplay(content=description)
    )
    view = LayoutView()
    view.add_item(container)

    try:
        await channel.send(view=view, allowed_mentions=discord.AllowedMentions.none())
    except Exception:
        try:
            embed = discord.Embed(
                title=title,
                description=description,
                color=0x2b2d31,
                timestamp=discord.utils.utcnow()
            )
            await channel.send(embed=embed, allowed_mentions=discord.AllowedMentions.none())
        except Exception as e:
            pass

# --- Giveaway ---

async def load_giveaways(guild_id: int) -> Dict[str, Dict[str, Any]]:
    doc = await get_config(guild_id, "giveaways")
    # doc looks like {"_id": guild_id, "G-123456": {...}, "G-987654": {...}}
    return {k: v for k, v in doc.items() if k != "_id"}

async def save_giveaways(guild_id: int, data: Dict[str, Dict[str, Any]]) -> None:
    # merge the data into the config format
    doc = {"_id": guild_id}
    doc.update(data)
    await save_config(guild_id, "giveaways", doc)

async def generate_giveaway_id(guild_id: int) -> str:
    data = await load_giveaways(guild_id)
    while True:
        gid = "G-" + "".join(random.choices(string.digits, k=6))
        if gid not in data:
            return gid

async def create_giveaway_entry(
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
    data = await load_giveaways(guild_id)
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
    await save_giveaways(guild_id, data)
    return entry

async def get_giveaway(guild_id: int, giveaway_id: str) -> Dict[str, Any] | None:
    data = await load_giveaways(guild_id)
    clean_gid = giveaway_id.strip().upper()
    if not clean_gid.startswith("G-"):
        if f"G-{clean_gid}" in data:
            return data[f"G-{clean_gid}"]
    return data.get(clean_gid)

async def get_giveaway_by_message_id(guild_id: int, message_id: int) -> Dict[str, Any] | None:
    data = await load_giveaways(guild_id)
    for entry in data.values():
        if entry.get("message_id") == message_id:
            return entry
    return None

async def update_giveaway_entry(guild_id: int, entry: Dict[str, Any]) -> None:
    data = await load_giveaways(guild_id)
    gid = entry["giveaway_id"]
    data[gid] = entry
    await save_giveaways(guild_id, data)

async def get_all_active_giveaways() -> List[tuple[int, Dict[str, Any]]]:
    active = []
    all_docs = await get_all_configs("giveaways")
    for doc in all_docs:
        gid = doc.get("_id")
        if not gid:
            continue
        for key, entry in doc.items():
            if key == "_id":
                continue
            if isinstance(entry, dict) and not entry.get("ended"):
                active.append((gid, entry))
    return active

# --- AutoResponder ---

async def load_responses(guild_id: int) -> Dict[str, dict]:
    doc = await get_config(guild_id, "autoresponders")
    data = {k: v for k, v in doc.items() if k != "_id"}

    for k, v in data.items():
        if isinstance(v, str):
            data[k] = {"response": v, "channel_id": None}
            
    return data

async def save_responses(guild_id: int, data: Dict[str, dict]) -> None:
    doc = {"_id": guild_id}
    doc.update(data)
    await save_config(guild_id, "autoresponders", doc)

async def add_response(guild_id: int, trigger: str, response: str, channel_id: int | None = None) -> None:
    data = await load_responses(guild_id)
    data[trigger.lower()] = {"response": response, "channel_id": channel_id}
    await save_responses(guild_id, data)

async def remove_response(guild_id: int, trigger: str) -> bool:
    data = await load_responses(guild_id)
    key = trigger.lower()
    if key in data:
        del data[key]
        await save_responses(guild_id, data)
        return True
    return False

async def get_response_entry(guild_id: int, trigger: str) -> dict | None:
    data = await load_responses(guild_id)
    return data.get(trigger.lower())

# --- Welcome ---
DEFAULT_MESSAGE = "Welcome {user} to **{server}**! We are happy to have you as member #{count}."

async def load_welcome_config(guild_id: int) -> Dict[str, Any]:
    doc = await get_config(guild_id, "welcome")
    if "enabled" not in doc:
        doc["enabled"] = False
    if "channel_id" not in doc:
        doc["channel_id"] = None
    if "message" not in doc or not doc["message"]:
        doc["message"] = DEFAULT_MESSAGE
    return doc

async def save_welcome_config(guild_id: int, config: Dict[str, Any]) -> None:
    await save_config(guild_id, "welcome", config)

async def setup_welcome(guild_id: int, channel_id: int, message: str = None) -> Dict[str, Any]:
    config = await load_welcome_config(guild_id)
    config["enabled"] = True
    config["channel_id"] = channel_id
    if message and message.strip():
        config["message"] = message.strip()
    await save_welcome_config(guild_id, config)
    return config

async def set_welcome_status(guild_id: int, enabled: bool) -> Dict[str, Any]:
    config = await load_welcome_config(guild_id)
    config["enabled"] = enabled
    await save_welcome_config(guild_id, config)
    return config

async def reset_welcome(guild_id: int) -> Dict[str, Any]:
    config = {"enabled": False, "channel_id": None, "message": DEFAULT_MESSAGE}
    await save_welcome_config(guild_id, config)
    return config

# --- Afk ---
async def load_afk(guild_id: int) -> Dict[str, Dict[str, Any]]:
    doc = await get_config(guild_id, "afk")
    return {k: v for k, v in doc.items() if k != "_id"}

async def save_afk(guild_id: int, data: Dict[str, Dict[str, Any]]) -> None:
    doc = {"_id": guild_id}
    doc.update(data)
    await save_config(guild_id, "afk", doc)

async def set_afk(guild_id: int, user_id: int, reason: str) -> None:
    data = await load_afk(guild_id)
    data[str(user_id)] = {
        "reason": reason or "AFK",
        "timestamp": int(time.time())
    }
    await save_afk(guild_id, data)

async def remove_afk(guild_id: int, user_id: int) -> bool:
    data = await load_afk(guild_id)
    uid_str = str(user_id)
    if uid_str not in data:
        return False
    del data[uid_str]
    await save_afk(guild_id, data)
    return True

async def get_afk(guild_id: int, user_id: int) -> Dict[str, Any] | None:
    data = await load_afk(guild_id)
    return data.get(str(user_id))

# --- AutoMod ---
DEFAULT_AUTOMOD_CONFIG = {
    "enabled": True,
    "anti_link": {
        "enabled": True,
        "delete_msg": True,
        "action": "warn",
        "whitelist_roles": []
    },
    "anti_spam": {
        "enabled": True,
        "max_messages": 5,
        "time_window_sec": 3,
        "max_mentions": 4,
        "action": "warn",
        "timeout_duration_sec": 300
    },
    "anti_alt": {
        "enabled": True,
        "min_age_days": 3,
        "action": "kick"
    }
}

async def load_automod_config(guild_id: int) -> Dict[str, Any]:
    doc = await get_config(guild_id, "automod")
    data = {k: v for k, v in doc.items() if k != "_id"}
    
    for key, val in DEFAULT_AUTOMOD_CONFIG.items():
        if key not in data:
            data[key] = val
        elif isinstance(val, dict) and isinstance(data[key], dict):
            for subkey, subval in val.items():
                if subkey not in data[key]:
                    data[key][subkey] = subval
    return data

async def save_automod_config(guild_id: int, config: Dict[str, Any]) -> None:
    await save_config(guild_id, "automod", config)

# --- Blacklist ---
async def load_blacklist(guild_id: int) -> Dict[str, Dict[str, Any]]:
    doc = await get_config(guild_id, "blacklist")
    return {k: v for k, v in doc.items() if k != "_id"}

async def save_blacklist(guild_id: int, data: Dict[str, Dict[str, Any]]) -> None:
    doc = {"_id": guild_id}
    doc.update(data)
    await save_config(guild_id, "blacklist", doc)

async def add_to_blacklist(guild_id: int, user_id: int, reason: str, added_by: int) -> bool:
    data = await load_blacklist(guild_id)
    uid_str = str(user_id)
    if uid_str in data:
        return False
    data[uid_str] = {
        "reason": reason or "No reason provided",
        "added_by": added_by
    }
    await save_blacklist(guild_id, data)
    return True

async def remove_from_blacklist(guild_id: int, user_id: int) -> bool:
    data = await load_blacklist(guild_id)
    uid_str = str(user_id)
    if uid_str not in data:
        return False
    del data[uid_str]
    await save_blacklist(guild_id, data)
    return True

async def is_blacklisted(guild_id: int, user_id: int) -> bool:
    data = await load_blacklist(guild_id)
    return str(user_id) in data

# --- JoinRole ---
async def load_join_roles(guild_id: int) -> List[int]:
    doc = await get_config(guild_id, "joinroles")
    return doc.get("roles", [])

async def save_join_roles(guild_id: int, roles: List[int]) -> None:
    await save_config(guild_id, "joinroles", {"roles": roles})

async def add_join_role(guild_id: int, role_id: int) -> bool:
    roles = await load_join_roles(guild_id)
    if role_id in roles:
        return False
    roles.append(role_id)
    await save_join_roles(guild_id, roles)
    return True

async def remove_join_role(guild_id: int, role_id: int) -> bool:
    roles = await load_join_roles(guild_id)
    if role_id not in roles:
        return False
    roles.remove(role_id)
    await save_join_roles(guild_id, roles)
    return True

async def clear_join_roles(guild_id: int) -> int:
    roles = await load_join_roles(guild_id)
    count = len(roles)
    if count > 0:
        await save_join_roles(guild_id, [])
    return count

# --- JoinToCreate ---
async def load_jtc_config(guild_id: int) -> Dict[str, Any]:
    doc = await get_config(guild_id, "jtc_config")
    if "enabled" not in doc:
        doc["enabled"] = False
    if "hub_channel_id" not in doc:
        doc["hub_channel_id"] = None
    if "category_id" not in doc:
        doc["category_id"] = None
    if "default_user_limit" not in doc:
        doc["default_user_limit"] = 0
    return doc

async def save_jtc_config(guild_id: int, data: Dict[str, Any]) -> None:
    await save_config(guild_id, "jtc_config", data)

async def load_active_channels(guild_id: int) -> Dict[str, Dict[str, Any]]:
    doc = await get_config(guild_id, "jtc_channels")
    return {k: v for k, v in doc.items() if k != "_id"}

async def save_active_channels(guild_id: int, data: Dict[str, Dict[str, Any]]) -> None:
    doc = {"_id": guild_id}
    doc.update(data)
    await save_config(guild_id, "jtc_channels", doc)

async def get_active_channel(guild_id: int, channel_id: int) -> Dict[str, Any] | None:
    data = await load_active_channels(guild_id)
    return data.get(str(channel_id))

async def create_active_channel(guild_id: int, channel_id: int, owner_id: int, message_id: int = 0) -> Dict[str, Any]:
    data = await load_active_channels(guild_id)
    entry = {
        "channel_id": channel_id,
        "owner_id": owner_id,
        "locked": False,
        "hidden": False,
        "limit": 0,
        "trusted_users": [],
        "message_id": message_id
    }
    data[str(channel_id)] = entry
    await save_active_channels(guild_id, data)
    return entry

async def update_active_channel(guild_id: int, channel_id: int, entry: Dict[str, Any]) -> None:
    data = await load_active_channels(guild_id)
    data[str(channel_id)] = entry
    await save_active_channels(guild_id, data)

async def remove_active_channel(guild_id: int, channel_id: int) -> None:
    data = await load_active_channels(guild_id)
    ch_str = str(channel_id)
    if ch_str in data:
        del data[ch_str]
        await save_active_channels(guild_id, data)

# --- Mute ---
async def get_muted_role_id(guild_id: int) -> int | None:
    doc = await get_config(guild_id, "mute")
    return doc.get("role_id")

async def set_muted_role_id(guild_id: int, role_id: int) -> None:
    await save_config(guild_id, "mute", {"role_id": role_id})

# --- Poll ---
async def load_polls(guild_id: int) -> Dict[str, Dict[str, Any]]:
    doc = await get_config(guild_id, "polls")
    return {k: v for k, v in doc.items() if k != "_id"}

async def save_polls(guild_id: int, data: Dict[str, Dict[str, Any]]) -> None:
    doc = {"_id": guild_id}
    doc.update(data)
    await save_config(guild_id, "polls", doc)

async def generate_poll_id(guild_id: int) -> str:
    data = await load_polls(guild_id)
    while True:
        pid = "P-" + "".join(random.choices(string.digits, k=6))
        if pid not in data:
            return pid

async def create_poll_entry(guild_id: int, poll_id: str, channel_id: int, message_id: int, question: str, options: list[str], author_id: int) -> None:
    data = await load_polls(guild_id)
    data[poll_id] = {
        "channel_id": channel_id,
        "message_id": message_id,
        "question": question,
        "options": options,
        "author_id": author_id,
        "closed": False
    }
    await save_polls(guild_id, data)

async def get_poll_entry(guild_id: int, poll_id: str) -> Dict[str, Any] | None:
    data = await load_polls(guild_id)
    pid_clean = poll_id.strip().upper()
    if not pid_clean.startswith("P-"):
        if f"P-{pid_clean}" in data:
            return data[f"P-{pid_clean}"]
    return data.get(pid_clean)

async def close_poll_entry(guild_id: int, poll_id: str) -> bool:
    data = await load_polls(guild_id)
    pid_clean = poll_id.strip().upper()
    if not pid_clean.startswith("P-"):
        if f"P-{pid_clean}" in data:
            pid_clean = f"P-{pid_clean}"
            
    if pid_clean not in data:
        return False
    data[pid_clean]["closed"] = True
    await save_polls(guild_id, data)
    return True

# --- Reminder ---
import uuid

async def load_reminders() -> list[dict]:
    doc = await get_config(0, "reminders")
    return doc.get("reminders", [])

async def save_reminders(data: list[dict]):
    await save_config(0, "reminders", {"reminders": data})

async def add_reminder(user_id: int, channel_id: int, guild_id: int | None, text: str, duration_sec: int) -> dict:
    reminders = await load_reminders()
    now = int(time.time())
    rem_id = uuid.uuid4().hex[:6]
    entry = {
        "id": rem_id,
        "user_id": user_id,
        "channel_id": channel_id,
        "guild_id": guild_id,
        "text": text.strip(),
        "created_at": now,
        "expires_at": now + duration_sec
    }
    reminders.append(entry)
    await save_reminders(reminders)
    return entry

async def remove_reminder(rem_id: str, user_id: int | None = None) -> bool:
    reminders = await load_reminders()
    initial_len = len(reminders)
    if user_id is not None:
        filtered = [r for r in reminders if not (r["id"].lower() == rem_id.lower() and r["user_id"] == user_id)]
    else:
        filtered = [r for r in reminders if r["id"].lower() != rem_id.lower()]
    
    if len(filtered) != initial_len:
        await save_reminders(filtered)
        return True
    return False

async def get_user_reminders(user_id: int) -> list[dict]:
    reminders = await load_reminders()
    return [r for r in reminders if r["user_id"] == user_id]

# --- Voice ---
async def load_vcban(guild_id: int) -> Dict[str, Dict[str, Any]]:
    doc = await get_config(guild_id, "vcban")
    return {k: v for k, v in doc.items() if k != "_id"}

async def save_vcban(guild_id: int, data: Dict[str, Dict[str, Any]]) -> None:
    doc = {"_id": guild_id}
    doc.update(data)
    await save_config(guild_id, "vcban", doc)

async def add_to_vcban(guild_id: int, user_id: int, reason: str, added_by: int) -> bool:
    data = await load_vcban(guild_id)
    uid_str = str(user_id)
    if uid_str in data:
        return False
    data[uid_str] = {
        "reason": reason or "No reason provided",
        "added_by": added_by
    }
    await save_vcban(guild_id, data)
    return True

async def remove_from_vcban(guild_id: int, user_id: int) -> bool:
    data = await load_vcban(guild_id)
    uid_str = str(user_id)
    if uid_str not in data:
        return False
    del data[uid_str]
    await save_vcban(guild_id, data)
    return True

async def is_vcbanned(guild_id: int, user_id: int) -> bool:
    data = await load_vcban(guild_id)
    return str(user_id) in data

# --- Whitelist ---
async def load_whitelist(guild_id: int) -> Dict[str, Any]:
    doc = await get_config(guild_id, "whitelist")
    return {k: v for k, v in doc.items() if k != "_id"}

async def save_whitelist(guild_id: int, data: Dict[str, Any]) -> None:
    doc = {"_id": guild_id}
    doc.update(data)
    await save_config(guild_id, "whitelist", doc)

async def is_whitelisted(guild_id: int, user_id: int) -> bool:
    data = await load_whitelist(guild_id)
    return str(user_id) in data

async def add_to_whitelist(guild_id: int, user_id: int, reason: str, added_by: int) -> bool:
    data = await load_whitelist(guild_id)
    uid_str = str(user_id)
    if uid_str in data:
        return False
    data[uid_str] = {
        "reason": reason,
        "added_by": added_by,
        "timestamp": int(time.time())
    }
    await save_whitelist(guild_id, data)
    return True

async def remove_from_whitelist(guild_id: int, user_id: int) -> bool:
    data = await load_whitelist(guild_id)
    uid_str = str(user_id)
    if uid_str not in data:
        return False
    del data[uid_str]
    await save_whitelist(guild_id, data)
    return True

# --- OwnerOnly (DevMode) ---
async def load_devmode_config() -> dict:
    doc = await get_config(0, "devmode")
    if "enabled" not in doc:
        doc["enabled"] = False
    if "reason" not in doc:
        doc["reason"] = "System upgrades and developer testing"
    return doc

async def save_devmode_config(data: dict):
    await save_config(0, "devmode", data)

async def is_devmode_enabled() -> tuple[bool, str]:
    data = await load_devmode_config()
    return data.get("enabled", False), data.get("reason", "System upgrades and developer testing")
