import os
import time
from typing import List, Dict, Optional
import pymongo
from dotenv import load_dotenv

load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")

from Components.Database.mongodb import get_db

client = None
db = None
backups_col = None
backup_configs_col = None

MAX_BACKUPS = 5

def _init_collections():
    global db, backups_col, backup_configs_col
    if backups_col is None or backup_configs_col is None:
        try:
            db = get_db()
            if db is not None:
                backups_col = db["backups"]
                backup_configs_col = db["backup_configs"]
        except Exception as e:
            print(f"Warning: Failed to connect to MongoDB for Backup Storage: {e}")

_init_collections()

def clean_doc_for_json(doc):
    if not isinstance(doc, dict):
        return doc
    clean = {}
    for k, v in doc.items():
        if k == "_id":
            clean[k] = str(v)
        elif isinstance(v, dict):
            clean[k] = clean_doc_for_json(v)
        elif isinstance(v, list):
            clean[k] = [clean_doc_for_json(x) if isinstance(x, dict) else x for x in v]
        else:
            clean[k] = v
    return clean

def get_backups(guild_id: int) -> List[Dict]:
    _init_collections()
    if backups_col is None:
        return []
    try:
        cursor = backups_col.find({"guild_id": guild_id}).sort("timestamp", pymongo.DESCENDING)
        return [clean_doc_for_json(b) for b in cursor]
    except Exception as e:
        print(f"Backup Error (get_backups): {e}")
        return []

def get_backup(backup_id: str) -> Optional[Dict]:
    _init_collections()
    if backups_col is None:
        return None
    try:
        b = backups_col.find_one({"_id": backup_id})
        return clean_doc_for_json(b) if b else None
    except Exception as e:
        print(f"Backup Error (get_backup): {e}")
        return None

def save_backup(backup_data: Dict):
    _init_collections()
    if backups_col is None:
        return
    try:
        guild_id = backup_data.get("guild_id")
        existing_doc = backups_col.find_one({"_id": backup_data["_id"]})
        if not existing_doc and guild_id:
            # Enforce max 5 backups FIFO ring-buffer: delete oldest if limit reached
            existing_backups = list(backups_col.find({"guild_id": guild_id}).sort("timestamp", pymongo.ASCENDING))
            while len(existing_backups) >= MAX_BACKUPS:
                oldest = existing_backups.pop(0)
                backups_col.delete_one({"_id": oldest["_id"]})

        backups_col.update_one(
            {"_id": backup_data["_id"]},
            {"$set": backup_data},
            upsert=True
        )
    except Exception as e:
        print(f"Backup Error (save_backup): {e}")

def delete_backup(backup_id: str):
    _init_collections()
    if backups_col is None:
        return
    try:
        backups_col.delete_one({"_id": backup_id})
    except Exception as e:
        print(f"Backup Error (delete_backup): {e}")

def get_backup_config(guild_id: int) -> Dict:
    _init_collections()
    default_cfg = {
        "guild_id": guild_id,
        "enabled": False,
        "interval": "daily",
        "last_backup": None,
        "next_backup": None,
        "max_slots": MAX_BACKUPS
    }
    if backup_configs_col is None:
        return default_cfg
    try:
        cfg = backup_configs_col.find_one({"guild_id": guild_id})
        if cfg:
            cfg.pop("_id", None)
            default_cfg.update(cfg)
        default_cfg["max_slots"] = MAX_BACKUPS
        default_cfg.pop("_id", None)
        return default_cfg
    except Exception as e:
        print(f"Backup Error (get_backup_config): {e}")
        return default_cfg

def save_backup_config(guild_id: int, config_data: Dict):
    _init_collections()
    if backup_configs_col is None:
        return
    try:
        config_data["guild_id"] = guild_id
        config_data["max_slots"] = MAX_BACKUPS
        save_data = {k: v for k, v in config_data.items() if k != "_id"}
        backup_configs_col.update_one(
            {"guild_id": guild_id},
            {"$set": save_data},
            upsert=True
        )
        config_data.pop("_id", None)
    except Exception as e:
        print(f"Backup Error (save_backup_config): {e}")

def get_all_active_backup_configs() -> List[Dict]:
    _init_collections()
    if backup_configs_col is None:
        return []
    try:
        return [clean_doc_for_json(c) for c in backup_configs_col.find({"enabled": True})]
    except Exception as e:
        print(f"Backup Error (get_all_active_backup_configs): {e}")
        return []

def calculate_next_backup_timestamp(interval: str, from_time: int = None) -> int:
    base = from_time if from_time else int(time.time())
    interval_map = {
        "6h": 6 * 3600,
        "12h": 12 * 3600,
        "daily": 24 * 3600,
        "weekly": 7 * 24 * 3600
    }
    delta = interval_map.get(str(interval).lower(), 24 * 3600)
    return base + delta
