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
        client = pymongo.MongoClient(MONGODB_URI)
        db = client["orbit"]
        modlogs_col = db["modlogs"]
    except Exception as e:
        print(f"Warning: Failed to connect to MongoDB for ModLogs: {e}")

def add_modlog(guild_id: int, user_id: int, moderator_id: int, action_type: str, reason: str) -> None:
    if modlogs_col is None:
        return
    
    entry = {
        "guild_id": guild_id,
        "user_id": user_id,
        "moderator_id": moderator_id,
        "action_type": action_type,
        "reason": reason,
        "timestamp": int(time.time())
    }
    
    try:
        modlogs_col.insert_one(entry)
    except Exception as e:
        print(f"ModLog Error: Failed to insert entry: {e}")

def get_modlogs(guild_id: int, user_id: int) -> List[Dict[str, Any]]:
    if modlogs_col is None:
        return []
    try:
        cursor = modlogs_col.find({"guild_id": guild_id, "user_id": user_id}).sort("timestamp", pymongo.DESCENDING)
        return list(cursor)
    except Exception as e:
        print(f"ModLog Error: Failed to retrieve entries: {e}")
        return []

def get_modlogs_by_moderator(guild_id: int, moderator_id: int) -> List[Dict[str, Any]]:
    if modlogs_col is None:
        return []
    try:
        cursor = modlogs_col.find({"guild_id": guild_id, "moderator_id": moderator_id}).sort("timestamp", pymongo.DESCENDING)
        return list(cursor)
    except Exception as e:
        print(f"ModLog Error: Failed to retrieve entries for moderator: {e}")
        return []
