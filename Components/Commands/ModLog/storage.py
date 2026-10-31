import os
import time
from typing import List, Dict, Any
import pymongo
from dotenv import load_dotenv

load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")

client = None
db = None
modlogs_col = None

if MONGODB_URI:
    try:
        client = pymongo.MongoClient(
            MONGODB_URI,
            serverSelectionTimeoutMS=15000,
            connectTimeoutMS=10000,
            socketTimeoutMS=15000,
            retryWrites=True,
            retryReads=True,
            maxPoolSize=25
        )
        db = client["orbit"]
        modlogs_col = db["modlogs"]
    except Exception as e:
        print(f"Warning: Failed to connect to MongoDB for ModLogs: {e}")

def _get_all_modlog_cols():
    cols = []
    if modlogs_col is not None:
        cols.append(modlogs_col)
    try:
        from Components.Database.mongodb import get_db
        main_db = get_db()
        if main_db is not None:
            c = main_db["modlogs"]
            if not any(existing.full_name == c.full_name for existing in cols):
                cols.append(c)
    except Exception:
        pass
    return cols

def add_modlog(guild_id: int, user_id: int, moderator_id: int, action_type: str, reason: str) -> None:
    entry = {
        "guild_id": int(guild_id),
        "user_id": int(user_id),
        "moderator_id": int(moderator_id),
        "action_type": action_type,
        "reason": reason,
        "timestamp": int(time.time())
    }
    
    for col in _get_all_modlog_cols():
        try:
            col.insert_one(entry.copy())
        except Exception as e:
            print(f"ModLog Error: Failed to insert entry: {e}")

def get_modlogs(guild_id: int, user_id: int) -> List[Dict[str, Any]]:
    results = []
    for col in _get_all_modlog_cols():
        try:
            cursor = col.find({
                "guild_id": {"$in": [int(guild_id), str(guild_id)]},
                "user_id": {"$in": [int(user_id), str(user_id)]}
            }).sort("timestamp", pymongo.DESCENDING)
            results.extend(list(cursor))
        except Exception as e:
            print(f"ModLog Error: Failed to retrieve entries: {e}")
    return results

def get_modlogs_by_moderator(guild_id: int, moderator_id: int) -> List[Dict[str, Any]]:
    results = []
    for col in _get_all_modlog_cols():
        try:
            cursor = col.find({
                "guild_id": {"$in": [int(guild_id), str(guild_id)]},
                "moderator_id": {"$in": [int(moderator_id), str(moderator_id)]}
            }).sort("timestamp", pymongo.DESCENDING)
            results.extend(list(cursor))
        except Exception as e:
            print(f"ModLog Error: Failed to retrieve entries for moderator: {e}")
    return results

def get_recent_modlogs(guild_id: int, limit: int = 25) -> List[Dict[str, Any]]:
    raw_logs: List[Dict[str, Any]] = []

    # 1. Read from modlogs collections (never delete old logs)
    for col in _get_all_modlog_cols():
        try:
            cursor = col.find({
                "guild_id": {"$in": [int(guild_id), str(guild_id)]}
            }).sort("timestamp", pymongo.DESCENDING).limit(limit * 2)
            for doc in cursor:
                raw_logs.append({
                    "guild_id": int(guild_id),
                    "user_id": doc.get("user_id"),
                    "moderator_id": doc.get("moderator_id"),
                    "action_type": doc.get("action_type") or doc.get("action") or "Mod Action",
                    "reason": doc.get("reason") or "No reason provided",
                    "timestamp": int(doc.get("timestamp") or 0)
                })
        except Exception as e:
            print(f"ModLog Error: Failed to read modlogs collection: {e}")

    # 2. Read from Cases collection in main OrbitBot DB
    try:
        from Components.Database.mongodb import get_db
        main_db = get_db()
        if main_db is not None:
            cases_cursor = main_db["Cases"].find({
                "guild_id": {"$in": [int(guild_id), str(guild_id)]}
            }).sort("timestamp", pymongo.DESCENDING).limit(limit * 2)
            for c in cases_cursor:
                act = str(c.get("action") or "Mod Action").capitalize()
                raw_logs.append({
                    "guild_id": int(guild_id),
                    "user_id": c.get("user_id"),
                    "moderator_id": c.get("moderator_id"),
                    "action_type": act,
                    "reason": c.get("reason") or "No reason provided",
                    "timestamp": int(c.get("timestamp") or 0),
                    "case_id": c.get("case_id")
                })
    except Exception as e:
        print(f"ModLog Error: Failed to read Cases collection: {e}")

    # 3. Read from WarnHistory / Warn config in main OrbitBot DB
    try:
        from Components.Commands.Warn._storage import load_warn_history
        all_warns = load_warn_history(int(guild_id))
        if isinstance(all_warns, dict):
            for target_uid, warns in all_warns.items():
                if not isinstance(warns, list):
                    continue
                for w in warns:
                    if not isinstance(w, dict):
                        continue
                    raw_logs.append({
                        "guild_id": int(guild_id),
                        "user_id": target_uid,
                        "moderator_id": w.get("moderator_id") or w.get("moderator"),
                        "action_type": "Warn",
                        "reason": w.get("reason") or "No reason provided",
                        "timestamp": int(w.get("timestamp") or 0)
                    })
    except Exception as e:
        print(f"ModLog Error: Failed to read WarnHistory: {e}")

    # 4. Read from Ban history config in main OrbitBot DB
    try:
        from Components.Commands.Ban._storage import load_ban_history
        all_bans = load_ban_history(int(guild_id))
        if isinstance(all_bans, dict):
            for target_uid, bans in all_bans.items():
                if not isinstance(bans, list):
                    continue
                for b in bans:
                    if not isinstance(b, dict):
                        continue
                    raw_logs.append({
                        "guild_id": int(guild_id),
                        "user_id": target_uid,
                        "moderator_id": b.get("moderator_id") or b.get("moderator"),
                        "action_type": "Ban",
                        "reason": b.get("reason") or "No reason provided",
                        "timestamp": int(b.get("timestamp") or 0)
                    })
    except Exception as e:
        print(f"ModLog Error: Failed to read BanHistory: {e}")

    # Sort newest first and deduplicate entries representing the same event
    raw_logs.sort(key=lambda x: x.get("timestamp", 0), reverse=True)
    deduped: List[Dict[str, Any]] = []
    for entry in raw_logs:
        uid_str = str(entry.get("user_id") or "")
        act_norm = str(entry.get("action_type") or "").lower().strip()
        ts = int(entry.get("timestamp") or 0)
        reason_norm = str(entry.get("reason") or "").strip().lower()

        is_dup = False
        for existing in deduped:
            ex_uid = str(existing.get("user_id") or "")
            ex_act = str(existing.get("action_type") or "").lower().strip()
            ex_ts = int(existing.get("timestamp") or 0)
            ex_reason = str(existing.get("reason") or "").strip().lower()

            if uid_str == ex_uid and abs(ts - ex_ts) <= 5:
                if act_norm in ex_act or ex_act in act_norm or reason_norm == ex_reason:
                    is_dup = True
                    break
        if not is_dup:
            deduped.append(entry)
            if len(deduped) >= limit:
                break

    return deduped
