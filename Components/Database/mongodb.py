import os
import time
import threading
from pymongo import MongoClient
from typing import Dict, Any, Optional

_client: Optional[MongoClient] = None
_db = None
_config_cache: Dict[tuple, tuple[float, Dict[str, Any]]] = {}
_cache_lock = threading.Lock()
CONFIG_CACHE_TTL = 15.0  # seconds

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
    """Fast primary key query hitting B-Tree indexed _id first, then guild_id, without throwing ValueError."""
    if collection is None:
        return None
    gid_str = str(guild_id)
    is_num = gid_str.isdigit()

    # 1. Direct index lookup on _id (fastest, MongoDB clustered index <1ms)
    doc = collection.find_one({"_id": gid_str})
    if doc:
        return doc
    if is_num:
        doc = collection.find_one({"_id": int(guild_id)})
        if doc:
            return doc

    # 2. Secondary lookup on guild_id field
    doc = collection.find_one({"guild_id": gid_str})
    if doc:
        return doc
    if is_num:
        doc = collection.find_one({"guild_id": int(guild_id)})
        if doc:
            return doc

    return None

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

            # 2. Query alternate casings if not found
            if not doc:
                alt_names = []
                c_low = collection_name.lower()
                c_cap = collection_name.capitalize()
                if c_low != collection_name:
                    alt_names.append(c_low)
                if c_cap != collection_name and c_cap not in alt_names:
                    alt_names.append(c_cap)
                for alt in alt_names:
                    doc = _query_collection_doc(db[alt], guild_id)
                    if doc:
                        break

            # 3. Query candidate databases (orbit, OrbitBot, Orbit) if not found
            if not doc and _client is not None:
                target_dbs = ["orbit", "OrbitBot", "Orbit"]
                for db_name in target_dbs:
                    if db is not None and db.name == db_name:
                        continue
                    try:
                        cand_db = _client[db_name]
                        doc = _query_collection_doc(cand_db[collection_name], guild_id)
                        if doc:
                            break
                        for alt in [collection_name.lower(), collection_name.capitalize()]:
                            doc = _query_collection_doc(cand_db[alt], guild_id)
                            if doc:
                                break
                        if doc:
                            break
                    except Exception:
                        pass
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
