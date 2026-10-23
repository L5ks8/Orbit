from Components.Database.mongodb import get_config, set_config
import os
import json
import pathlib
import time
from typing import Dict, Any, Optional

STORAGE_ROOT = pathlib.Path("Storage")

def _get_file_path(guild_id: int) -> pathlib.Path:
    folder = STORAGE_ROOT / str(guild_id)
    if not folder.exists():
        folder.mkdir(parents=True, exist_ok=True)
    return folder / "ticket.json"

def load_ticket_config(guild_id: int) -> Dict[str, Any]:
    default_cfg = {
        "enabled": False,
        "panel_channel_id": None,
        "category_id": None,
        "support_role_id": None,
        "log_channel_id": None,
        "panel_title": "Support Ticket Desk",
        "panel_description": "Click the button below to open a direct support channel with our team.",
        "panel_instructions": "> Select your desired inquiry category in the dropdown menu below, then click **Create Ticket**.",
        "options": [],
        "options_slots": [],
        "ticket_counter": 0,
        "active_tickets": {},
        "closed_tickets": [],
        "blacklist": {},
        "auto_close_time_enabled": False,
        "auto_close_time_hours": 24,
        "max_open_tickets": 3,
        "naming_format": "",
        "staff_only_close": False,
        "ping_support_roles": True,
        "ping_custom_role_enabled": False,
        "ping_custom_role_id": None,
        "claiming_enabled": False
    }
    
    try:
        data = get_config("Ticket", guild_id)
        if not data:
            data = default_cfg.copy()
    except Exception:
        data = default_cfg.copy()

    if not isinstance(data, dict):
        data = default_cfg.copy()

    for k, v in default_cfg.items():
        if k not in data:
            data[k] = v

    if not isinstance(data.get("active_tickets"), dict):
        data["active_tickets"] = {}
    if not isinstance(data.get("closed_tickets"), list):
        data["closed_tickets"] = []
        
    now = time.time()
    thirty_days = 30 * 24 * 60 * 60
    data["closed_tickets"] = [t for t in data["closed_tickets"] if isinstance(t, dict) and now - t.get("closed_at", now) < thirty_days]

    if not isinstance(data.get("blacklist"), dict):
        data["blacklist"] = {}
    if not isinstance(data.get("options"), list):
        data["options"] = []
    if not isinstance(data.get("options_slots"), list):
        data["options_slots"] = []
    return data

def save_ticket_config(guild_id: int, config: Dict[str, Any]) -> None:
    set_config("Ticket", guild_id, config)

def setup_ticket_config(
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
    config = load_ticket_config(guild_id)
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
    save_ticket_config(guild_id, config)
    return config

def create_active_ticket(
    guild_id: int,
    channel_id: int,
    creator_id: int,
    subject: str,
    description: str,
    category_option: str = "General Support",
    status: str = "open"
) -> int:
    config = load_ticket_config(guild_id)
    counter = config.get("ticket_counter", 0) + 1
    config["ticket_counter"] = counter
    config["active_tickets"][str(channel_id)] = {
        "id": str(channel_id),
        "channel_id": str(channel_id),
        "creator_id": creator_id,
        "claimed_by": None,
        "created_at": time.time(),
        "subject": subject,
        "description": description,
        "category_option": category_option,
        "number": counter,
        "status": status
    }
    save_ticket_config(guild_id, config)
    return counter

def claim_ticket(guild_id: int, channel_id: int, claimer_id: int) -> Optional[Dict[str, Any]]:
    config = load_ticket_config(guild_id)
    ticket_data = config.get("active_tickets", {}).get(str(channel_id))
    if not ticket_data:
        return None
    ticket_data["claimed_by"] = claimer_id
    ticket_data["status"] = "claimed"
    config["active_tickets"][str(channel_id)] = ticket_data
    save_ticket_config(guild_id, config)
    return ticket_data

def close_active_ticket(guild_id: int, channel_id: int, final_status: str = "resolved") -> Optional[Dict[str, Any]]:
    config = load_ticket_config(guild_id)
    ticket_data = config.get("active_tickets", {}).pop(str(channel_id), None)
    if ticket_data:
        ticket_data["closed_at"] = time.time()
        ticket_data["status"] = final_status
        if "closed_tickets" not in config:
            config["closed_tickets"] = []
        config["closed_tickets"].append(ticket_data)
        save_ticket_config(guild_id, config)
    return ticket_data

def reset_ticket_config(guild_id: int) -> Dict[str, Any]:
    default_config = load_ticket_config(0)
    save_ticket_config(guild_id, default_config)
    return default_config

def is_blacklisted(guild_id: int, user_id: int) -> bool:
    config = load_ticket_config(guild_id)
    blacklist = config.get("blacklist", {})
    uid_str = str(user_id)
    if uid_str in blacklist:
        expiry = blacklist[uid_str]
        if expiry is None:
            return True
        if time.time() < expiry:
            return True
        else:
            del blacklist[uid_str]
            save_ticket_config(guild_id, config)
    return False

def add_to_blacklist(guild_id: int, user_id: int, duration_seconds: Optional[int] = None) -> None:
    config = load_ticket_config(guild_id)
    if "blacklist" not in config:
        config["blacklist"] = {}
    uid_str = str(user_id)
    if duration_seconds is None:
        config["blacklist"][uid_str] = None
    else:
        config["blacklist"][uid_str] = time.time() + duration_seconds
    save_ticket_config(guild_id, config)

def remove_from_blacklist(guild_id: int, user_id: int) -> bool:
    config = load_ticket_config(guild_id)
    uid_str = str(user_id)
    if "blacklist" in config and uid_str in config["blacklist"]:
        del config["blacklist"][uid_str]
        save_ticket_config(guild_id, config)
        return True
    return False
