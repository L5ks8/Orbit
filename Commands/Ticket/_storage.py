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
    try:
        os.chmod(STORAGE_ROOT, 0o777)
    except Exception:
        pass
    try:
        os.chmod(folder, 0o777)
    except Exception:
        pass
    return folder / "ticket.json"

def load_ticket_config(guild_id: int) -> Dict[str, Any]:
    path = _get_file_path(guild_id)
    if not path.exists():
        return {
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
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if "active_tickets" not in data:
                data["active_tickets"] = {}
            if "ticket_counter" not in data:
                data["ticket_counter"] = 0
            if "log_channel_id" not in data:
                data["log_channel_id"] = None
            if "options" not in data or not isinstance(data["options"], list):
                data["options"] = []
            if "options_slots" not in data or not isinstance(data["options_slots"], list):
                data["options_slots"] = []
            return data
    except Exception:
        return {
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

def save_ticket_config(guild_id: int, config: Dict[str, Any]) -> None:
    path = _get_file_path(guild_id)
    if path.exists():
        try:
            os.chmod(path, 0o666)
        except Exception:
            pass
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=4)
    except PermissionError:
        try:
            path.unlink(missing_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                json.dump(config, f, indent=4)
        except Exception as e:
            print(f"[STORAGE ERROR] Permission denied saving {path}: {e}")
            raise e

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

def create_active_ticket(guild_id: int, channel_id: int, creator_id: int, subject: str, description: str, category_option: str = "General Support") -> int:
    config = load_ticket_config(guild_id)
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
    save_ticket_config(guild_id, config)
    return counter

def claim_ticket(guild_id: int, channel_id: int, claimer_id: int) -> Optional[Dict[str, Any]]:
    config = load_ticket_config(guild_id)
    ticket_data = config.get("active_tickets", {}).get(str(channel_id))
    if not ticket_data:
        return None
    ticket_data["claimed_by"] = claimer_id
    config["active_tickets"][str(channel_id)] = ticket_data
    save_ticket_config(guild_id, config)
    return ticket_data

def close_active_ticket(guild_id: int, channel_id: int) -> Optional[Dict[str, Any]]:
    config = load_ticket_config(guild_id)
    ticket_data = config.get("active_tickets", {}).pop(str(channel_id), None)
    if ticket_data:
        save_ticket_config(guild_id, config)
    return ticket_data

def reset_ticket_config(guild_id: int) -> Dict[str, Any]:
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
    save_ticket_config(guild_id, default_config)
    return default_config
