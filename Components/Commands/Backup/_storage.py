import os
from typing import List, Dict, Optional
import pymongo
from dotenv import load_dotenv

load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")

client = None
db = None
backups_col = None

if MONGODB_URI:
    try:
        client = pymongo.MongoClient(MONGODB_URI)
        db = client["orbit"]
        backups_col = db["backups"]
    except Exception as e:
        print(f"Warning: Failed to connect to MongoDB for Backup Storage: {e}")

def get_backups(guild_id: int) -> List[Dict]:
    if backups_col is None:
        return []
    try:
        cursor = backups_col.find({"guild_id": guild_id}).sort("timestamp", pymongo.DESCENDING)
        return list(cursor)
    except Exception as e:
        print(f"Backup Error (get_backups): {e}")
        return []

def get_backup(backup_id: str) -> Optional[Dict]:
    if backups_col is None:
        return None
    try:
        return backups_col.find_one({"_id": backup_id})
    except Exception as e:
        print(f"Backup Error (get_backup): {e}")
        return None

def save_backup(backup_data: Dict):
    if backups_col is None:
        return
    try:
        backups_col.update_one(
            {"_id": backup_data["_id"]},
            {"$set": backup_data},
            upsert=True
        )
    except Exception as e:
        print(f"Backup Error (save_backup): {e}")

def delete_backup(backup_id: str):
    if backups_col is None:
        return
    try:
        backups_col.delete_one({"_id": backup_id})
    except Exception as e:
        print(f"Backup Error (delete_backup): {e}")
