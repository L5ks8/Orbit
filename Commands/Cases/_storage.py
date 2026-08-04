import time
from typing import Dict, Any, List, Optional
from Database.mongodb import get_db
def _get_cases_collection():
    db = get_db()
    if db is not None:
        return db["Cases"]
    return None
def _get_settings_collection():
    db = get_db()
    if db is not None:
        return db["CasesSettings"]
    return None
def create_case(guild_id: int, user_id: int, moderator_id: int, action: str, reason: str = "No reason provided") -> Optional[int]:
    """
    Creates a new case and returns the incremental case ID.
    action: "ban", "kick", "timeout", "warn", "unban", "untimeout"
    """
    col = _get_cases_collection()
    settings_col = _get_settings_collection()
    if col is None or settings_col is None:
        return None
    settings = settings_col.find_one_and_update(
        {"_id": str(guild_id)},
        {"$inc": {"last_case_id": 1}},
        upsert=True,
        return_document=True
    )
    case_id = settings.get("last_case_id", 1)
    doc = {
        "guild_id": str(guild_id),
        "case_id": case_id,
        "user_id": str(user_id),
        "moderator_id": str(moderator_id),
        "action": action,
        "reason": reason,
        "timestamp": int(time.time())
    }
    col.insert_one(doc)
    return case_id
def get_case(guild_id: int, case_id: int) -> Optional[Dict[str, Any]]:
    col = _get_cases_collection()
    if col is None:
        return None
    return col.find_one({"guild_id": str(guild_id), "case_id": case_id})
def get_user_cases(guild_id: int, user_id: int) -> List[Dict[str, Any]]:
    col = _get_cases_collection()
    if col is None:
        return []
    return list(col.find({"guild_id": str(guild_id), "user_id": str(user_id)}).sort("case_id", -1))
def update_case_reason(guild_id: int, case_id: int, new_reason: str) -> bool:
    col = _get_cases_collection()
    if col is None:
        return False
    res = col.update_one(
        {"guild_id": str(guild_id), "case_id": case_id},
        {"$set": {"reason": new_reason}}
    )
    return res.modified_count > 0
def delete_case(guild_id: int, case_id: int) -> bool:
    col = _get_cases_collection()
    if col is None:
        return False
    res = col.delete_one({"guild_id": str(guild_id), "case_id": case_id})
    return res.deleted_count > 0