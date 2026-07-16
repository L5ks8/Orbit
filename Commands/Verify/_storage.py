from typing import Dict, Any, Optional
from Database.mongo import get_config, save_config

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
