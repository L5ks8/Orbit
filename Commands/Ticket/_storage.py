import time
from typing import Dict, Any, Optional
from Database.mongo import get_config, save_config

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
