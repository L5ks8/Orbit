from typing import Dict, Any
from Database.mongodb import get_config, get_db

def load_appeals_config(guild_id: int) -> Dict[str, Any]:
    db = get_db()
    if db is None:
        return {}
    doc = db["Appeals"].find_one({"_id": str(guild_id)})
    if not doc:
        return {
            "enabled": False,
            "channel_id": "",
            "mod_roles": [],
            "allowed_punishments": [],
            "custom_url": ""
        }
    return doc

def save_appeals_config(guild_id: int, data: Dict[str, Any]) -> None:
    db = get_db()
    if db is not None:
        db["Appeals"].update_one(
            {"_id": str(guild_id)},
            {"$set": data},
            upsert=True
        )

def get_appeals_config_by_url(custom_url: str) -> Dict[str, Any]:
    db = get_db()
    if db is None:
        return None
    return db["Appeals"].find_one({"custom_url": custom_url, "enabled": True})

def register_appeal_submission(guild_id: int, user_id: int) -> None:
    db = get_db()
    if db is not None:
        import time
        db["AppealHistory"].update_one(
            {"guild_id": str(guild_id), "user_id": str(user_id)},
            {"$set": {"last_submitted": time.time(), "is_open": True}},
            upsert=True
        )

def get_appeal_status(guild_id: int, user_id: int) -> Dict[str, Any]:
    db = get_db()
    if db is None:
        return None
    return db["AppealHistory"].find_one({"guild_id": str(guild_id), "user_id": str(user_id)})

def close_appeal(guild_id: int, user_id: int) -> None:
    db = get_db()
    if db is not None:
        db["AppealHistory"].update_one(
            {"guild_id": str(guild_id), "user_id": str(user_id)},
            {"$set": {"is_open": False}}
        )
