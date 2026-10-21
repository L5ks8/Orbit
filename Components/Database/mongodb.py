import os
import time
import threading
from pymongo import MongoClient
from typing import Dict, Any

_client = None
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
        
        _db = _client["OrbitBot"]
    return _db

def get_config(collection_name: str, guild_id: int, default_config: Dict[str, Any] = None) -> Dict[str, Any]:
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

    try:
        db = get_db()
        collection = db[collection_name]
        doc = collection.find_one({"_id": str(guild_id)})
    except Exception as e:
        print(f"[MongoDB] Query error for {collection_name}:{guild_id}: {e}")
        doc = None
    
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
            import os, json
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

def set_config(collection_name: str, guild_id: int, config: Dict[str, Any]) -> None:
    cache_key = (collection_name, str(guild_id))
    doc = config.copy()
    with _cache_lock:
        _config_cache[cache_key] = (time.time(), doc.copy())

    try:
        db = get_db()
        collection = db[collection_name]
        
        doc["_id"] = str(guild_id)
        collection.replace_one({"_id": str(guild_id)}, doc, upsert=True)
    except Exception as e:
        print(f"[MongoDB] Save error for {collection_name}:{guild_id}: {e}")
