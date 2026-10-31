import os
import time
import threading
import asyncio
from pymongo import MongoClient
from typing import Dict, Any, Optional

_client: Optional[MongoClient] = None
_db = None
_config_cache: Dict[tuple, tuple[float, Dict[str, Any]]] = {}
_cache_lock = threading.Lock()
CONFIG_CACHE_TTL = 300.0  # seconds (5 minutes cache - immediately invalidated upon set_config)

_existing_collections_cache: Dict[str, set] = {}
_existing_collections_time = 0.0

def _get_collection_names(database) -> set:
    global _existing_collections_time
    if database is None:
        return set()
    now = time.time()
    db_name = database.name
    if db_name not in _existing_collections_cache or now - _existing_collections_time > 600.0:
        try:
            _existing_collections_cache[db_name] = set(database.list_collection_names())
            _existing_collections_time = now
        except Exception:
            return _existing_collections_cache.get(db_name, set())
    return _existing_collections_cache.get(db_name, set())

def get_db():
    global _client, _db
    if _client is None:
        uri = os.environ.get("MONGODB_URI")
        if not uri:
            from dotenv import load_dotenv
            load_dotenv()
            uri = os.environ.get("MONGODB_URI")
        
        mongo_kwargs = {
            "serverSelectionTimeoutMS": 15000,
            "connectTimeoutMS": 10000,
            "socketTimeoutMS": 15000,
            "retryWrites": True,
            "retryReads": True,
            "maxPoolSize": 50
        }
        if not uri:
            print("WARNING: MONGODB_URI is not set. Database will not work properly.")
            _client = MongoClient("mongodb://localhost:27017/", **mongo_kwargs) 
        else:
            _client = MongoClient(uri, **mongo_kwargs)
        
    if _db is None and _client is not None:
        # Determine the database: check default database from URI, or check candidate names
        try:
            default_db = _client.get_default_database()
            if default_db is not None and default_db.name not in ("admin", "local", "test", ""):
                _db = default_db
                print(f"[MongoDB] Using default URI database: '{_db.name}'")
        except Exception:
            _db = None

        if _db is None:
            cand_names = ["OrbitBot", "orbit", "Orbit"]
            best_db = None
            max_cols = -1
            for cand in cand_names:
                try:
                    c_db = _client[cand]
                    c_list = c_db.list_collection_names()
                    col_count = len(c_list)
                    print(f"[MongoDB] Database candidate '{cand}' has {col_count} collections: {c_list[:6]}")
                    if col_count > max_cols:
                        max_cols = col_count
                        best_db = c_db
                except Exception as e:
                    print(f"[MongoDB] Candidate '{cand}' check error: {e}")

            if best_db is not None and max_cols > 0:
                _db = best_db
                print(f"[MongoDB] Selected active database: '{_db.name}' (with {max_cols} collections)")
            else:
                _db = _client["OrbitBot"]
                print(f"[MongoDB] Fallback active database: '{_db.name}'")
        _ensure_background_indexes(_db)
    return _db

_indexes_ensured = False
def _ensure_background_indexes(db):
    global _indexes_ensured
    if _indexes_ensured or db is None:
        return
    _indexes_ensured = True
    def _worker():
        try:
            db["GuildStats"].create_index("guild_id", background=True)
            db["GuildStats"].create_index([("guild_id", 1), ("date", -1)], background=True)
            db["LevelData"].create_index("guild_id", background=True)
            db["InviteTracker"].create_index("guild_id", background=True)
            db["InviteStats"].create_index("guild_id", background=True)
            db["UptimeStats"].create_index("date", background=True)
            print("[MongoDB] Ensured collection indexes on background thread.", flush=True)
        except Exception as e:
            print(f"[MongoDB] Error ensuring background indexes: {e}", flush=True)
    threading.Thread(target=_worker, daemon=True, name="mongo_indexer").start()

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
            existing_cols = _get_collection_names(db)
            
            # Determine target collection if it exists in db
            target_col = None
            if collection_name in existing_cols:
                target_col = collection_name
            elif collection_name.lower() in existing_cols:
                target_col = collection_name.lower()
            elif collection_name.capitalize() in existing_cols:
                target_col = collection_name.capitalize()
            elif not existing_cols:
                # If existing_cols failed to list, try exact name directly
                target_col = collection_name

            if target_col is not None:
                doc = _query_collection_doc(db[target_col], guild_id)

            # Candidate database fallback: only if not found and a candidate DB actually has the collection
            if not doc and _client is not None:
                for cand_name in ["OrbitBot", "orbit", "Orbit"]:
                    if db.name == cand_name:
                        continue
                    try:
                        cand_db = _client[cand_name]
                        cand_cols = _get_collection_names(cand_db)
                        cand_target = None
                        if collection_name in cand_cols:
                            cand_target = collection_name
                        elif collection_name.lower() in cand_cols:
                            cand_target = collection_name.lower()
                        elif collection_name.capitalize() in cand_cols:
                            cand_target = collection_name.capitalize()
                        
                        if cand_target is not None:
                            doc = _query_collection_doc(cand_db[cand_target], guild_id)
                            if doc:
                                print(f"[MongoDB] Found {collection_name}:{guild_id} in candidate database '{cand_name}'")
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
    if collection_name.lower() in [
        "blacklist", "whitelist", "warn", "warnhistory", "ban",
        "giveaway", "poll", "afk", "voice", "autoresponder"
    ]:
        doc.pop("guild_id", None)
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
        if db.name in _existing_collections_cache:
            _existing_collections_cache[db.name].add(collection_name)
        try:
            if isinstance(guild_id, (int, str)) and str(guild_id).isdigit():
                collection.delete_one({"_id": int(guild_id)})
        except Exception:
            pass
    except Exception as e:
        print(f"[MongoDB] Save error for {collection_name}:{guild_id}: {e}")

async def get_config_async(collection_name: str, guild_id: Any, default_config: Dict[str, Any] = None) -> Dict[str, Any]:
    """Non-blocking async wrapper around get_config."""
    return await asyncio.to_thread(get_config, collection_name, guild_id, default_config)

async def set_config_async(collection_name: str, guild_id: Any, config: Dict[str, Any]) -> None:
    """Non-blocking async wrapper around set_config."""
    await asyncio.to_thread(set_config, collection_name, guild_id, config)
