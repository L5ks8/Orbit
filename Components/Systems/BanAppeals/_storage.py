import re
from typing import Dict, Any, List
from Components.Database.mongodb import get_db

RESERVED_SLUGS = {
    "api", "dashboard", "appeal", "appeals", "docs", "login", "logout",
    "admin", "settings", "leaderboard", "invite", "bot", "static", "orbit"
}

def is_custom_url_available(custom_url: str, guild_id: int) -> bool:
    if not custom_url:
        return True
    db = get_db()
    if db is None:
        return True
    clean_url = str(custom_url).strip().lower()
    clean_url = re.sub(r"[^a-z0-9_-]", "", clean_url)
    if not clean_url or clean_url in RESERVED_SLUGS:
        return False

    gid_str = str(guild_id)
    gid_num = int(guild_id) if gid_str.isdigit() else None
    id_list = [gid_str]
    if gid_num is not None:
        id_list.append(gid_num)

    query = {
        "custom_url": {"$regex": f"^{re.escape(clean_url)}$", "$options": "i"},
        "_id": {"$nin": id_list},
        "guild_id": {"$nin": [str(gid_str)]}
    }
    existing = db["Appeals"].find_one(query)
    return existing is None

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

    # Auto-clean legacy or duplicate custom_url to prevent cross-server bleed
    cur_url = str(merged.get("custom_url") or "").strip().lower()
    if cur_url:
        if cur_url in RESERVED_SLUGS or not is_custom_url_available(cur_url, guild_id):
            merged["custom_url"] = ""
            try:
                db["Appeals"].update_one(
                    {"$or": [{"_id": gid_str}, {"_id": int(gid_str)} if gid_str.isdigit() else {"_id": gid_str}]},
                    {"$set": {"custom_url": ""}}
                )
            except Exception:
                pass

    return merged

def save_appeals_config(guild_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
    db = get_db()
    if db is not None:
        clean = dict(data)
        clean.pop("_id", None)
        clean["guild_id"] = str(guild_id)

        # Enforce unique custom_url
        raw_url = str(clean.get("custom_url") or "").strip().lower()
        if raw_url:
            clean_url = re.sub(r"[^a-z0-9_-]", "", raw_url)
            if not is_custom_url_available(clean_url, guild_id):
                existing = load_appeals_config(guild_id)
                clean["custom_url"] = existing.get("custom_url", "")
            else:
                clean["custom_url"] = clean_url
        else:
            clean["custom_url"] = ""

        gid_str = str(guild_id)
        filter_q = {"$or": [{"_id": gid_str}]}
        if gid_str.isdigit():
            filter_q["$or"].append({"_id": int(gid_str)})

        existing = db["Appeals"].find_one(filter_q)
        target_id = existing["_id"] if existing else gid_str
        db["Appeals"].update_one(
            {"_id": target_id},
            {"$set": clean},
            upsert=True
        )
    return load_appeals_config(guild_id)

def get_appeals_config_by_url(custom_url: str) -> Dict[str, Any]:
    db = get_db()
    if db is None or not custom_url:
        return None
    url_clean = str(custom_url).strip().lower()

    # Match by vanity slug (case-insensitive) OR direct guild_id
    query_or = [
        {"custom_url": {"$regex": f"^{re.escape(url_clean)}$", "$options": "i"}},
        {"_id": url_clean},
        {"guild_id": url_clean}
    ]
    if url_clean.isdigit():
        query_or.append({"_id": int(url_clean)})
        query_or.append({"guild_id": int(url_clean)})

    return db["Appeals"].find_one({
        "$or": query_or,
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
