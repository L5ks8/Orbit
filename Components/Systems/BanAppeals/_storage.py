from typing import Dict, Any, List
from Components.Database.mongodb import get_db

def load_appeals_config(guild_id: int) -> Dict[str, Any]:
    default_cfg = {
        "enabled": False,
        "channel_id": "",
        "mod_roles": [],
        "allowed_punishments": ["ban", "timeout"],
        "custom_url": "",
        "mention_mods": True,
        "cooldown_days": 3,
        "multiple_submissions": False,
        "anonymous_mods": False,
        "invite_unbanned": True,
        "banner_url": "",
        "welcome_text": "Submit a pardon request to the server moderation team.",
        "custom_questions": [
            {"id": "q1", "label": "Why was the sanction issued?", "required": True},
            {"id": "q2", "label": "Why should the staff team reconsider and lift your punishment?", "required": True}
        ]
    }
    db = get_db()
    if db is None:
        return default_cfg

    gid_str = str(guild_id)
    doc = db["Appeals"].find_one({"_id": gid_str})
    if not doc and gid_str.isdigit():
        doc = db["Appeals"].find_one({"_id": int(gid_str)})
    if not doc:
        return default_cfg

    doc.pop("_id", None)
    merged = {**default_cfg, **doc}
    return merged

def save_appeals_config(guild_id: int, data: Dict[str, Any]) -> None:
    db = get_db()
    if db is not None:
        clean = dict(data)
        clean.pop("_id", None)
        clean["guild_id"] = str(guild_id)
        db["Appeals"].update_one(
            {"_id": str(guild_id)},
            {"$set": clean},
            upsert=True
        )

def get_appeals_config_by_url(custom_url: str) -> Dict[str, Any]:
    db = get_db()
    if db is None or not custom_url:
        return None
    url_clean = str(custom_url).strip()
    return db["Appeals"].find_one({
        "custom_url": {"$regex": f"^{url_clean}$", "$options": "i"},
        "enabled": True
    })

def register_appeal_submission(guild_id: int, user_id: int, user_name: str = "", user_avatar: str = "", action: str = "", reason: str = "", responses: dict = None) -> None:
    db = get_db()
    if db is not None:
        import time
        doc = {
            "last_submitted": time.time(),
            "is_open": True,
            "status": "pending",
            "user_name": user_name,
            "user_avatar": user_avatar,
            "action": action,
            "reason": reason,
            "responses": responses or {}
        }
        db["AppealHistory"].update_one(
            {"guild_id": str(guild_id), "user_id": str(user_id)},
            {"$set": doc},
            upsert=True
        )

def get_appeal_status(guild_id: int, user_id: int) -> Dict[str, Any]:
    db = get_db()
    if db is None:
        return None
    return db["AppealHistory"].find_one({"guild_id": str(guild_id), "user_id": str(user_id)})

def close_appeal(guild_id: int, user_id: int, status: str = "denied", moderator: str = "a Moderator") -> None:
    db = get_db()
    if db is not None:
        import time
        db["AppealHistory"].update_one(
            {"guild_id": str(guild_id), "user_id": str(user_id)},
            {"$set": {
                "is_open": False,
                "status": status,
                "resolved_at": time.time(),
                "resolved_by": moderator
            }}
        )

def get_open_appeals(guild_id: int) -> List[Dict[str, Any]]:
    db = get_db()
    if db is None:
        return []
    cursor = db["AppealHistory"].find({"guild_id": str(guild_id), "is_open": True}).sort("last_submitted", -1)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results

def get_appeals_history(guild_id: int, limit: int = 50) -> List[Dict[str, Any]]:
    db = get_db()
    if db is None:
        return []
    cursor = db["AppealHistory"].find({"guild_id": str(guild_id)}).sort("last_submitted", -1).limit(limit)
    results = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        results.append(doc)
    return results
