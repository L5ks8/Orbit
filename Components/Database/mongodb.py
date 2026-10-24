import os
import time
import threading
from pymongo import MongoClient
from typing import Dict, Any, Optional

_client: Optional[MongoClient] = None
_db = None
_config_cache: Dict[tuple, tuple[float, Dict[str, Any]]] = {}
_cache_lock = threading.Lock()
CONFIG_CACHE_TTL = 60.0  # seconds

def get_db():
    global _client, _db
    if _client is None:
        uri = os.environ.get("MONGODB_URI")
        if not uri:
            from dotenv import load_dotenv
            load_dotenv()
            uri = os.environ.get("MONGODB_URI")
        
        mongo_kwargs = {
            "serverSelectionTimeoutMS": 5000,
            "connectTimeoutMS": 5000,
            "socketTimeoutMS": 10000,
            "maxPoolSize": 50
        }
        if not uri:
            print("WARNING: MONGODB_URI is not set. Database will not work properly.")
            _client = MongoClient("mongodb://localhost:27017/", **mongo_kwargs) 
        else:
            _client = MongoClient(uri, **mongo_kwargs)
        
        # Determine the database: check default database from URI, or check candidate names
        try:
            default_db = _client.get_default_database()
            if default_db is not None and default_db.name not in ("admin", "local", "test", ""):
                _db = default_db
            else:
                _db = _client["OrbitBot"]
        except Exception:
            _db = _client["OrbitBot"]
    return _db

def _query_collection_doc(collection, guild_id):
    """Fast indexed query using $in to test str and int _id in 1 query, then secondary guild_id."""
    if collection is None:
        return None
    gid_str = str(guild_id)
    if gid_str.isdigit():
        gid_num = int(guild_id)
        # 1. Direct index lookup on _id (B-Tree clustered index, single query)
        doc = collection.find_one({"_id": {"$in": [gid_str, gid_num]}})
        if doc:
            return doc
        # 2. Secondary lookup on guild_id field
        return collection.find_one({"guild_id": {"$in": [gid_str, gid_num]}})

    doc = collection.find_one({"_id": gid_str})
    if doc:
        return doc
    return collection.find_one({"guild_id": gid_str})

def get_config(collection_name: str, guild_id: Any, default_config: Dict[str, Any] = None) -> Dict[str, Any]:
    cache_key = (collection_name, str(guild_id))
    now = time.time()
    with _cache_lock:
        if cache_key in _config_cache:
            cached_time, cached_val = _config_cache[cache_key]
            if now - cached_time < CONFIG_CACHE_TTL:
                res = cached_val.copy()
                if default_config:
                    return {**default_config, **res}
                return res

    doc = None
    try:
        db = get_db()
        if db is not None:
            # 1. Query exact collection name
            collection = db[collection_name]
            doc = _query_collection_doc(collection, guild_id)

            # 2. Fast casing fallback (lowercase or capitalized) if not found
            if not doc and collection_name.lower() != collection_name:
                doc = _query_collection_doc(db[collection_name.lower()], guild_id)
            if not doc and collection_name.capitalize() != collection_name and collection_name.capitalize() != collection_name.lower():
                doc = _query_collection_doc(db[collection_name.capitalize()], guild_id)
    except Exception as e:
        print(f"[MongoDB] Query error for {collection_name}:{guild_id}: {e}")
        doc = None
    
    # Legacy file migration fallback
    if not doc:
        file_to_collection = {
            'ticket.json': 'Ticket', 'verify.json': 'Verify', 'automod.json': 'AutoMod',
            'welcome.json': 'Welcome', 'goodbye.json': 'Goodbye',
            'boost.json': 'Boost', 'level_config.json': 'Level', 'jtc_config.json': 'JoinToCreate',
            'jtc_channels.json': 'JoinToCreate_Channels', 'blacklist.json': 'Blacklist',
            'whitelist.json': 'Whitelist', 'afk.json': 'Afk', 'autoresponder.json': 'AutoResponder',
            'automation.json': 'ChannelAutomation', 'joinroles.json': 'JoinRole'
        }
        filename = next((k for k, v in file_to_collection.items() if v == collection_name), None)
        if filename:
            import json
            path = os.path.join("Storage", str(guild_id), filename)
            if os.path.exists(path):
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        migrated = json.load(f)
                    if migrated:
                        doc = migrated
                        set_config(collection_name, guild_id, migrated)
                        try:
                            os.remove(path)
                        except Exception:
                            pass
                except Exception:
                    pass

    if not doc:
        res = default_config.copy() if default_config else {}
        with _cache_lock:
            _config_cache[cache_key] = (now, res.copy())
        return res
    
    doc.pop("_id", None)
    with _cache_lock:
        _config_cache[cache_key] = (now, doc.copy())
    
    if default_config:
        return {**default_config, **doc}
    return doc

def set_config(collection_name: str, guild_id: Any, config: Dict[str, Any]) -> None:
    cache_key = (collection_name, str(guild_id))
    doc = config.copy()
    with _cache_lock:
        _config_cache[cache_key] = (time.time(), doc.copy())
        _config_cache.pop((collection_name.lower(), str(guild_id)), None)
        _config_cache.pop((collection_name.capitalize(), str(guild_id)), None)

    try:
        db = get_db()
        collection = db[collection_name]
        
        doc["_id"] = str(guild_id)
        doc["guild_id"] = str(guild_id)
        collection.replace_one({"_id": str(guild_id)}, doc, upsert=True)
        try:
            if isinstance(guild_id, (int, str)) and str(guild_id).isdigit():
                collection.delete_one({"_id": int(guild_id)})
        except Exception:
            pass
    except Exception as e:
        print(f"[MongoDB] Save error for {collection_name}:{guild_id}: {e}")
